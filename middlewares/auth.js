const isLoggedin = (req, res, next) => {
    if (req.session.user === null || req.session.user === undefined) {
        req.flash("alertMessage", `Session telah habis. Silakan login kembali`);
        req.flash("alertStatus", "danger");
        res.redirect("/admin/signin")
    } else {
        next()
    }
}

module.exports = isLoggedin