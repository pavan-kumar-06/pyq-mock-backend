import mongoose, { Schema } from "mongoose";
// import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// const responseSchema = new Schema({
//     // answerSubmitted:{
//     //     type: Number,
//     //     required: true
//     // },
//     // subject: {
//     //     type: String,
//     //     enum: ["physics", "chemistry", "biology", "maths"], // Add more subjects if needed
//     //     required: true
//     // },
//     // isCorrect:{
//     //     type: Boolean,
//     //     default: false
//     // }
//     // timeTaken: {
//     //     type: Number, // in seconds
//     //     default: 0,
//     //     required: true
//     // }
// });

const attemptSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    testId: {
      type: Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
    // attemptCount: {
    //     type: Number,
    //     default: 0,
    //     validate: {
    //       validator: function(v) {
    //         // Ensure that the attemptCount does not exceed 1
    //         return v >= 0 && v <= 2;
    //       },
    //       message: props =>
    //         `${props.value} Maximum attempt allowed is 2.`
    //     }
    // },
    // startTime: {
    //     type: Date,
    //     default: Date.now // Default value is the current timestamp when the document is created
    // },
    score: {
      type: Number,
      default: 0,
    },
    responses: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true }
);

// attemptSchema.plugin(mongooseAggregatePaginate);

export const Attempt = mongoose.model("Attempt", attemptSchema);
