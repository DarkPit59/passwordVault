module.exports.register = async (request, response, next) => {
    try {

    // Write your logic here        
        return response.json({
            status: true,
            message: "You have registered as an admin successfully",
            data: null,
        });
    } catch (e) {
        console.log(e);
        return response.status(500).json({
            status: false,
            message: "Something went wrong. Please try again",
            data: null,
        });
    }
};