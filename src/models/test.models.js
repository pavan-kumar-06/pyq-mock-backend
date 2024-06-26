import mongoose, {Schema} from "mongoose";

const questionSchema = new Schema({
    questionType:{
        type: String,
        enum: ["mcq,numerical"],
        required: true
    },
    //contains image url or text so well limit the character count
    question: {
        type: String,
        required: true,
        maxlength: 2000
    },
    questionFormat: {
        type: String,
        enum: ["image", "text"],
        required: true
    },
    solution: {
        type: String,
        required: true,
        maxlength: 2000
    },
    solutionFormat: {
        type: String,
        enum: ["image", "text"],
        required: true
    },
    correctAnswer: {
        type: Number,
        required: true
    },
    subject: {
        type: String,
        enum: ["physics", "chemistry", "biology", "maths"], // Add more subjects if needed
        required: true
    }
    //in future we can add chapter and topic as well
});

const testSchema = new Schema({
    testName: {
        type: String,
        required: true,
        maxlength: 100
    },
    testType: {
        type: String,
        enum : ['jee-mains','neet','afmc'],
        required: true
    },
    testYear: {
        type: Number,
        required: true
    },
    testDuration: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true,
        validate: {
            validator: function(value) {
                // Limit totalQuestions to be between 1 and 300
                return value >= 1 && value <= 300;
            },
            message: 'Total questions must be between 1 and 300'
        }
    },
    questions: [questionSchema]
}, {timestamps: true})



export const Test = mongoose.model("Test", testSchema);