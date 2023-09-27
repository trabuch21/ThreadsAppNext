import moongose from 'mongoose';

const userSchema = new moongose.Schema({
    id: {type: String, required: true},
    username: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    image: String,
    bio: String,
    threads: [{
        type: moongose.Schema.Types.ObjectId,
        ref: 'Thread'
    }],
    onboarded: {type: Boolean, default: false},
    communities: [
        {
            type: moongose.Schema.Types.ObjectId,
            ref: 'Community'
        }
    ]
})

const User = moongose.models.User || moongose.model('User', userSchema);

export default User;