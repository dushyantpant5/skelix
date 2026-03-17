interface Comment {
  id: string
  author: string
  body: string
  avatar: string
}

export function CommentThread({ comments }: { comments: Comment[] }) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <img className="h-8 w-8 rounded-full" src={comment.avatar} alt="" />
          <div className="space-y-1">
            <span className="font-medium text-sm">{comment.author}</span>
            <p className="text-sm">{comment.body}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
