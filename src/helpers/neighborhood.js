const axios = require("axios").default;
const getNeighborhood = async (address) => {
    const randEmail =
        Math.random().toString(36).substring(2, 15) + "@" + Date.now() + ".com";
    const res = await axios.post(
        "https://nextdoor.com/ajax/account/validate/",
        {
            address: {
                street_address: address.streetAddress,
                unit: address.unit,
                city: address.city,
                state: address.state,
                zip_code: address.zipcode,
                residence_id: null
            },
            email_address: randEmail
        }
    );
    const neighborhood = res.data.context.neighborhood;
    if (!neighborhood) {
        const error = new Error("Neighborhood is null");
        error.statusCode = 418;
        throw error;
    }
    return neighborhood;
};

module.exports = {
    getNeighborhood
};
