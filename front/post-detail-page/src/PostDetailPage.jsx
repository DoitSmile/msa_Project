import React, { useState } from "react";
import { MessageCircle, Eye, Clock, Heart, Trash2, Edit } from "lucide-react";
import "./PostDetailPage.css";

const Comment = ({ comment, onReply, onDelete }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (replyContent.trim() !== "") {
      onReply(comment.id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
    }
  };

  return (
    <div className="border-b last:border-b-0 py-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <span className="font-medium mr-2">{comment.author}</span>
          <span className="text-sm text-gray-500">{comment.timestamp}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onDelete(comment.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-gray-700 mb-2">{comment.content}</p>
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="text-blue-500 text-sm hover:underline"
        >
          답글
        </button>
      </div>
      {comment.replies &&
        comment.replies.map((reply, index) => (
          <div
            key={reply.id}
            className="ml-6 mt-3 border-l-2 border-gray-200 pl-4"
          >
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <span className="font-medium mr-2">{reply.author}</span>
                <span className="text-sm text-gray-500">{reply.timestamp}</span>
              </div>
              <button
                onClick={() => onDelete(comment.id, reply.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-gray-700">{reply.content}</p>
            {index < comment.replies.length - 1 && (
              <div className="my-3 border-b border-gray-200"></div>
            )}
          </div>
        ))}
      {showReplyForm && (
        <form
          onSubmit={handleReplySubmit}
          className="mt-4 ml-6 bg-gray-100 p-4 rounded-lg"
        >
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="답글을 입력하세요..."
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
            rows="3"
          />
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={() => setShowReplyForm(false)}
              className="mr-2 px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition duration-200"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
            >
              등록
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const PostDetailPage = () => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [postTitle, setPostTitle] = useState(
    "오늘의 맛집 리뷰: 서울 핫플 카페"
  );
  const [postContent, setPostContent] = useState(
    "오늘은 서울의 새로운 핫플레이스로 떠오른 카페를 다녀왔습니다. " +
      "인테리어부터 음료, 디저트까지 모든 것이 완벽했어요. " +
      "특히 시그니처 메뉴인 '클라우드 라떼'는 꼭 드셔보세요!"
  );
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "유저1",
      content: "좋은 정보 감사합니다!",
      timestamp: "2024-01-15 14:30",
      replies: [
        {
          id: 101,
          author: "유저3",
          content: "저도 동의합니다!",
          timestamp: "2024-01-15 15:00",
        },
      ],
    },
    {
      id: 2,
      author: "유저2",
      content: "저도 같은 경험이 있어요.",
      timestamp: "2024-01-15 15:45",
      replies: [],
    },
  ]);
  const [newComment, setNewComment] = useState("");

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim() !== "") {
      const newCommentObj = {
        id: comments.length + 1,
        author: "현재사용자",
        content: newComment,
        timestamp: new Date().toLocaleString(),
        replies: [],
      };
      setComments([...comments, newCommentObj]);
      setNewComment("");
    }
  };

  const handleReply = (commentId, replyContent) => {
    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        const newReply = {
          id: Date.now(),
          author: "현재사용자",
          content: replyContent,
          timestamp: new Date().toLocaleString(),
        };
        return { ...comment, replies: [...comment.replies, newReply] };
      }
      return comment;
    });
    setComments(updatedComments);
  };

  const handleDeleteComment = (commentId, replyId = null) => {
    if (replyId) {
      const updatedComments = comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: comment.replies.filter((reply) => reply.id !== replyId),
          };
        }
        return comment;
      });
      setComments(updatedComments);
    } else {
      setComments(comments.filter((comment) => comment.id !== commentId));
    }
  };

  const handleDeletePost = () => {
    alert("게시글이 삭제되었습니다.");
  };

  const handleEditPost = () => {
    setIsEditing(true);
  };

  const handleSavePost = () => {
    setIsEditing(false);
    // 여기에서 서버로 수정된 내용을 저장하는 로직을 추가할 수 있습니다.
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gray-100 min-h-screen font-sans">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          {isEditing ? (
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="text-2xl font-bold w-full border-b border-gray-300 focus:outline-none focus:border-blue-500"
            />
          ) : (
            <h1 className="text-2xl font-bold">{postTitle}</h1>
          )}
          <div className="flex space-x-2">
            {isEditing ? (
              <button
                onClick={handleSavePost}
                className="text-green-500 hover:text-green-700"
              >
                저장
              </button>
            ) : (
              <button
                onClick={handleEditPost}
                className="text-blue-500 hover:text-blue-700"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleDeletePost}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <img
              src="/api/placeholder/40/40"
              alt="User Avatar"
              className="w-10 h-10 rounded-full mr-3"
            />
            <span className="font-medium">김감자</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>2024-01-15 10:30</span>
          </div>
        </div>
        {isEditing ? (
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="6"
          />
        ) : (
          <p className="text-gray-800 mb-6 leading-relaxed">{postContent}</p>
        )}
        <div className="flex items-center justify-between text-gray-600 border-t pt-4">
          <button
            onClick={handleBookmark}
            className="flex items-center hover:text-red-500 transition duration-200"
          >
            <Heart
              className={`w-5 h-5 mr-1 ${
                isBookmarked ? "fill-current text-red-500" : ""
              }`}
            />
            <span>{isBookmarked ? "찜됨" : "찜하기"}</span>
          </button>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <MessageCircle className="w-5 h-5 mr-1" />
              <span>{comments.length}</span>
            </div>
            <div className="flex items-center">
              <Eye className="w-5 h-5 mr-1" />
              <span>1,234</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">댓글 {comments.length}개</h2>
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            onReply={handleReply}
            onDelete={handleDeleteComment}
          />
        ))}
        <form onSubmit={handleCommentSubmit} className="mt-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요..."
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="3"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
            >
              댓글 작성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostDetailPage;
