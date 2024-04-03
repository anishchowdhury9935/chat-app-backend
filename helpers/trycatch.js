async function tryCatch(code,res) {
    // res argument is important to be there 
    try {
        await code()
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "internal server error" });
    }
}
module.exports = tryCatch;