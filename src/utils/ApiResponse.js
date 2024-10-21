class ApiResponse{
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400  // SEE : Mdn/HTTP response status codes
    }
}

export { ApiResponse }