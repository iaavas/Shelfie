import crypto from 'crypto';
import mongoose, { Document, Schema } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

export interface UserDocument extends Document {
    name: string;
    email: string;
    photo: string;
    role: string;
    password: string;
    passwordConfirm: string | undefined;
    active: boolean;
    passwordChangedAt?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    createPasswordResetToken: () => string;
    correctPassword: (candidatePassword: string, userPassword: string) => Promise<boolean>;
    changedPasswordAfter: (JWTTimeStamp: number) => boolean;
}

const emailValidator: (value: string) => boolean = validator.isEmail;

const userSchema: Schema<UserDocument> = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name'],
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Please tell us your email'],
        lowercase: true,
        validate: {
            validator: emailValidator,
            message: 'Please provide a valid email',
        },
    },
    photo: {
        type: String,
        default: 'default.jpg',
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (this: UserDocument, el: string) {
                return el === this.password;
            },
            message: 'Passwords do not match',
        },
    },
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
});

userSchema.pre('find', function (next) {
    this.find({ active: true });
    next();
});

userSchema.pre<UserDocument>('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm = undefined;
    next();
});

userSchema.pre<UserDocument>('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = new Date(Date.now() - 1000);
    next();
});

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    return resetToken;
};

userSchema.methods.correctPassword = async function (
    candidatePassword: string,
    userPassword: string
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp: number) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = Math.floor(
            this.passwordChangedAt.getTime() / 1000
        );

        return JWTTimeStamp < changedTimeStamp;
    }

    return false;
};

const User = mongoose.model<UserDocument>('User', userSchema);

export default User;
