import { parseAsBoolean, useQueryState } from "nuqs"

export const useCreateRoleModal = () =>{
    const [isOpen, setIsOpen] = useQueryState(
        "create-role",
        parseAsBoolean.withDefault(false)
    )

    const open = () => setIsOpen(true)
    const close = () => setIsOpen(false)

    return {
        isOpen,
        open,
        close
    }
}