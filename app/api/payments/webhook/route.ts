// Payment is deliberately closed until a real global provider, merchant account,
// verified event lookup, amount/currency matching and atomic fulfillment are integrated.
export async function POST(){return Response.json({error:"Payment fulfillment is not activated. No payment or credit will be applied."},{status:503});}
