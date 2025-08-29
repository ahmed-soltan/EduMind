import { useMutation } from "@tanstack/react-query";

type LoginPayload = {
	email: string;
	password: string;
};

type LoginResponse = {
	accessToken?: string;
	error?: string;
};

async function login(payload: LoginPayload): Promise<LoginResponse> {
	const res = await fetch("/api/auth/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
		credentials: "include", // ensure cookies are set
	});
	return res.json();
}

export function useLogin() {
	return useMutation<LoginResponse, Error, LoginPayload>({
		mutationFn: login,
	});
}
