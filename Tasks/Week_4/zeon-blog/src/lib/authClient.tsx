export type LoginInput = {
    email: string;
    password: string;
}

export type SignupInput = {
    name: string;
    email: string;
    password: string;
    confirmPass: string;
}

export type AuthResult =
    | { type: "authenticated"; user: { name: string; email: string; } }
    | { type: "unauthenticated"; error: string };

const USERS = [
    { email: "parva@test.com", password: "parva123", name: "Parva" },
    { email: "demo@test.com", password: "demo123", name: "Demo User" },
];

export async function login(input: LoginInput): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();
    const password = input.password;


    // const res = await fetch("/api/login", { method:"POST", body: JSON.stringify(input) ... })
    // return await res.json()

    const found = USERS.find((u) => u.email === email && u.password === password);
    if (!found) return { type: "unauthenticated", error: "Invalid Email or Password!" };

    return { type: "authenticated", user: { name: found.name, email: found.email } };
}

export async function signup(input: SignupInput): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();
    const password = input.password, confirmPass = input.confirmPass;
    const name = input.name.trim();
    const preExist = USERS.some(user => user.email === email);
    if (preExist) return { type: "unauthenticated", error: "Email already exists!" };
    if (password.length < 6) {
        return { type: "unauthenticated", error: "Password must be atleast 6 characters!" };
    }
    if (password !== confirmPass) {
        return { type: "unauthenticated", error: "Password must match with Confirmed password!" };
    }
    return { type: "authenticated", user: { name, email } };
}