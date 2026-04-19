import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

// ─── 쿼리 (Server Component에서 직접 호출) ──────────

export async function getNotifications(userId: string, limit = 30) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      actor: { select: { nickname: true, publicId: true } },
    },
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

// ─── 댓글 알림 ────────────────────────────────────

export async function notifyNewComment({
  commentId,
  postId,
  authorId,
  parentId,
}: {
  commentId: string;
  postId: number;
  authorId: string;
  parentId: string | null;
}) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, title: true },
  });
  if (!post) return;

  type NotificationInput = Parameters<typeof prisma.notification.createMany>[0];
  type NotificationData = NonNullable<NotificationInput>["data"];
  const toCreate: NotificationData = [];

  if (parentId) {
    // 답글인 경우
    const parent = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { authorId: true },
    });

    // 부모 댓글 작성자에게 REPLY_TO_MY_COMMENT
    if (parent && parent.authorId !== authorId) {
      toCreate.push({
        userId: parent.authorId,
        actorUserId: authorId,
        type: NotificationType.REPLY_TO_MY_COMMENT,
        title: "내 댓글에 답글이 달렸습니다",
        body: post.title,
        link: `/posts/${postId}`,
        postId,
        commentId,
      });
    }

    // 게시글 작성자가 부모 댓글 작성자와 다를 때만 COMMENT_ON_MY_POST 추가
    // (이미 REPLY_TO_MY_COMMENT를 받는 사람에게 중복 전송 방지)
    const parentAuthorId = parent?.authorId;
    if (
      post.authorId !== authorId &&
      post.authorId !== parentAuthorId
    ) {
      toCreate.push({
        userId: post.authorId,
        actorUserId: authorId,
        type: NotificationType.COMMENT_ON_MY_POST,
        title: "내 게시글에 댓글이 달렸습니다",
        body: post.title,
        link: `/posts/${postId}`,
        postId,
        commentId,
      });
    }
  } else {
    // 최상위 댓글인 경우
    if (post.authorId !== authorId) {
      toCreate.push({
        userId: post.authorId,
        actorUserId: authorId,
        type: NotificationType.COMMENT_ON_MY_POST,
        title: "내 게시글에 댓글이 달렸습니다",
        body: post.title,
        link: `/posts/${postId}`,
        postId,
        commentId,
      });
    }
  }

  if (toCreate.length > 0) {
    await prisma.notification.createMany({ data: toCreate });
  }
}

// ─── 키워드 알림 ───────────────────────────────────

export async function notifyNewPost({
  postId,
  authorId,
  title,
  content,
}: {
  postId: number;
  authorId: string;
  title: string;
  content: string;
}) {
  const keywords = await prisma.notificationKeyword.findMany({
    where: {
      isEnabled: true,
      NOT: { userId: authorId }, // 본인 키워드 제외
    },
    select: { userId: true, keyword: true },
  });

  if (keywords.length === 0) return;

  const text = `${title} ${content}`.toLowerCase();

  // 매칭된 키워드 중 userId 기준으로 첫 번째 매칭 키워드만 사용 (중복 알림 방지)
  const matchedByUser = new Map<string, string>();
  for (const { userId, keyword } of keywords) {
    if (!matchedByUser.has(userId) && text.includes(keyword.toLowerCase())) {
      matchedByUser.set(userId, keyword);
    }
  }

  if (matchedByUser.size === 0) return;

  await prisma.notification.createMany({
    data: Array.from(matchedByUser.entries()).map(([userId, keyword]) => ({
      userId,
      actorUserId: authorId,
      type: NotificationType.KEYWORD_MATCH,
      title: `키워드 알림: "${keyword}"`,
      body: title,
      link: `/posts/${postId}`,
      postId,
    })),
  });
}
