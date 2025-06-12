import { model, Schema } from "mongoose";

const announcementSchema = new Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const announcementModel = model("Announcement", announcementSchema);

export default announcementModel;
