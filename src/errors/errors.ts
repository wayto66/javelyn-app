import { toast } from "react-toastify";

export class AppErrors {
  readonly message?: string;
  readonly type?: "WARN" | "ERROR";

  constructor(message?: string, type?: "WARN" | "ERROR") {
    this.message = message;
    this.type = type;
  }

  noSession(): void {
    toast.error("Não existe uma sessão ativa. Tente dar login novamente.");
  }

  apiResponse(id: string): void {
    toast.error(
      `Houve um erro ao tentar receber uma resposta do sistema. [#${id}]`
    );
  }
}
