async function tryCatch(code,res=null) {
    // res argument is important to be there if used for routers
    try {
        await code()
    } catch (error) {
        console.error(error);
        if(!res){return {error}};
        return res.status(500).json({ error: "internal server error" });
    }
}
module.exports = tryCatch;