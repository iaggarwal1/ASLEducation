export const frames = async (req, res, next) => {
  try {
    const response = await fetch(
      "http://asl-lb-575471465.us-east-1.elb.amazonaws.com/process_frames",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );

    const result = await response.json();
    res.json(result);
  } catch (err) {
    console.log(err);
  }
};
