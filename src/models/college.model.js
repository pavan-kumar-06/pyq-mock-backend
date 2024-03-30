import mongoose, {Schema} from "mongoose";

const collegeScheam = new Schema({
    name: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: String,
        validate: {
            validator: function(v) {
                // Ensure that the mobile number is exactly 10 digits long
                return /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid mobile number! Mobile number must be 10 digits long.`,
        },
        required: [true, 'Mobile number is required'] // Make the mobile number field required
    },
    email: {
        type:String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    totalStudents:{
        type: String
    }
}, {timestamps: true})



export const College = mongoose.model("College", collegeScheam);