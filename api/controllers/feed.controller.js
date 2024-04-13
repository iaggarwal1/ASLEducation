import sizeof from "object-sizeof";

export const frames = async (req, res, next) => {
  console.log(sizeof(req.body));
};
