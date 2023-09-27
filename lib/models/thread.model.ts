import moongose from "mongoose";

const threadSchema = new moongose.Schema({
  text: { type: String, required: true },
  author: {
    type: moongose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  community: {
    type: moongose.Schema.Types.ObjectId,
    ref: "Community",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  parentId: {
    type: String,
  },
  children: [
    {
      type: moongose.Schema.Types.ObjectId,
      ref: "Thread",
    },
  ],
});

const Thread = moongose.models.Thread || moongose.model("Thread", threadSchema);

export default Thread;
