import apiClient from "@/lib/api";
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
	const res = await apiClient("/api/auth/signup", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		data: JSON.stringify(payload),
		withCredentials: true, // ensure cookies are set
	});
	return res.data;
}

export function useSignup() {
	return useMutation<SignupResponse, Error, SignupPayload>({
		mutationFn: signup,
	});
}
