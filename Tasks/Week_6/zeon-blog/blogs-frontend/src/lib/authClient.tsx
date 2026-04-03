import { login as apiLogin, signup as apiSignup } from "./api/authApi";

export type LoginInput = {
  email: string;
  password: string;
};

export type SignupInput = {
  name: string;
  email: string;
  password: string;
  confirmPass: string;
};

export type AuthResult =
  | {
      type: "authenticated";
      user: {
        name: string;
        email: string;
        avatar: string | null;
        role: "admin" | "writer" | "reader";
        isProfileComplete: boolean;
      };
    }
  | { type: "unauthenticated"; error: string };

export async function login(input: LoginInput): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  try {
    const result = await apiLogin({ email, password });

    return {
      type: "authenticated",
      user: {
        name: result.user.name,
        email: result.user.email,
        avatar: result.user.avatar,
        role: result.user.role,
        isProfileComplete: result.user.isProfileComplete,
      },
    };
  } catch (error) {
    return {
      type: "unauthenticated",
      error:
        error instanceof Error
          ? error.message
          : "Invalid Email or Password!",
    };
  }
}

export async function signup(input: SignupInput): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const confirmPass = input.confirmPass;
  const name = input.name.trim();

  try {
    const result = await apiSignup({
      name,
      email,
      password,
      confirmPassword: confirmPass,
    });

    return {
      type: "authenticated",
      user: {
        name: result.user.name,
        email: result.user.email,
        avatar: result.user.avatar,
        role: result.user.role,
        isProfileComplete: result.user.isProfileComplete,
      },
    };
  } catch (error) {
    return {
      type: "unauthenticated",
      error:
        error instanceof Error
          ? error.message
          : "Signup failed. Please try again.",
    };
  }
}