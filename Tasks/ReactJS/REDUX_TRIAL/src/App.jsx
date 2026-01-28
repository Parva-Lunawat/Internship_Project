import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { increment, decrement, multiplier, exponential, squareRoot, resetValue, selectCount, } from "../components/counterSlice";

export default function App() {
  const count = useSelector(selectCount);
  const dispatch = useDispatch();

  const [op, setOp] = useState("increment");
  const [value, setValue] = useState("");

  const needsValue = useMemo(() => {
    return ["increment", "decrement", "multiply", "square", "sqrt", "reset"].includes(op);
  }, [op]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const n = Number(value);

    // For ops that need a number, validate it
    if (needsValue && !Number.isFinite(n)) return;

    if (op === "increment") dispatch(increment(n));
    else if (op === "decrement") dispatch(decrement(n));
    else if (op === "multiply") dispatch(multiplier(n));
    else if (op === "square") dispatch(exponential(n));
    else if (op === "sqrt") dispatch(squareRoot(n));
    else if (op === "reset") dispatch(resetValue(n));
    else return;

    setValue("");
  };

  return (
    <div className="min-h-[100vh] w-full flex flex-col content-center items-center justify-center">
      <h1 className="text-2xl font-semibold mb-4">
        Redux Toolkit Counter
      </h1>

      <div className="text-3xl font-bold mb-6">
        {count}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3"
      >
        <select
          value={op}
          onChange={(e) => setOp(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="increment">Increment (+n)</option>
          <option value="decrement">Decrement (-n)</option>
          <option value="multiply">Multiply (xn)</option>
          <option value="square">Power (^n)</option>
          <option value="sqrt">Nth Root (^(1/n))</option>
          <option value="reset">Reset to n</option>
        </select>

        {needsValue && (
          <input
            type="number"
            value={value}
            placeholder="Enter n"
            onChange={(e) => setValue(e.target.value)}
            className="w-28 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
        )}

        <button
          type="submit"
          disabled={needsValue && value.trim() === ""}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
