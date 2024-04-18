export const frames = async (req, res, next) => {
  try {
    const response = await fetch(process.env.AWS_DNS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const result = await response.json();
    res.json(result);
  } catch (err) {
    console.log(err);
  }
};
