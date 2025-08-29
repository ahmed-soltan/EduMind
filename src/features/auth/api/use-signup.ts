import { useMutation } from "@tanstack/react-query";

type SignupPayload = {
    firstName: string;
    lastName: string;
	email: string;
	password: string;
};

type SignupResponse = {
	accessToken?: string;
	error?: string;
};

async function signup(payload: SignupPayload): Promise<SignupResponse> {
	const res = await fetch("/api/auth/signup", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
		credentials: "include", // ensure cookies are set
	});
	return res.json();
}

export function useSignup() {
	return useMutation<SignupResponse, Error, SignupPayload>({
		mutationFn: signup,
	});
}
