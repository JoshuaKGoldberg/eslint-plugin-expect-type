// In TypeScript <5.5, elem will have type "string",
// but >=5.5 it will be "string | undefined".
const element = ["value", undefined].filter((x) => x != null)[0];

// This should error in 5.4, but not >=5.5.
// $ExpectType string
element;

// This should error in >=5.5, but not 5.4.
// $ExpectType string | undefined
element;
