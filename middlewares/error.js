class ErrorHandler extends Error{
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
    }
}
export const handleError = (err,req,res,next)=>{
    err.mssage = err.message || "Internal server error"
    err.statusCode = err.statusCode || 500;

    return res.status(err.statusCode).json(
        {
            success: false,
            message: err.message,
        }
    );

}
export default ErrorHandler;
