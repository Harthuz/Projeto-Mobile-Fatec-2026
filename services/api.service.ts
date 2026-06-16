const API_BASE_URL = "https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon";

export interface ApiStats {
  userId: string;
  username: string;
  level: number;
  vitorias: number;
  derrotas: number;
}

export interface ApiPokemon {
  index: string;
  name: string;
  image: string;
  types: string[];
  abilities: { name: string; strength: number }[];
}

export interface ApiTeamResponse {
  id: string;
  userId: string;
  team: ApiPokemon[];
  capture: ApiPokemon[];
}

export const apiService = {
  /**
   * Realiza o registro de um novo usuário.
   */
  async register(username: string, password: string): Promise<{ userId: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/v1/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || "Erro ao registrar usuário.");
    }

    return response.json();
  },

  /**
   * Realiza o login do usuário.
   */
  async login(username: string, password: string): Promise<{ userId: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/v1/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || "Credenciais inválidas.");
    }

    return response.json();
  },

  /**
   * Obtém as estatísticas do perfil do usuário.
   */
  async getStats(userId: string): Promise<ApiStats> {
    const response = await fetch(`${API_BASE_URL}/auth/v1/stats/${userId}`);
    if (!response.ok) {
      throw new Error("Erro ao carregar estatísticas do perfil.");
    }
    return response.json();
  },

  /**
   * Atualiza as estatísticas do perfil do usuário.
   */
  async updateStats(
    userId: string,
    stats: { level: string | number; vitorias: string | number; derrotas: string | number }
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/v1/stats/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        level: String(stats.level),
        vitorias: String(stats.vitorias),
        derrotas: String(stats.derrotas),
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao atualizar estatísticas no servidor.");
    }
  },

  /**
   * Retorna o time (titulares e capturados) do usuário.
   */
  async getTeam(userId: string): Promise<ApiTeamResponse> {
    const response = await fetch(`${API_BASE_URL}/pokemon/v1/team?user-id=${userId}`);
    if (!response.ok) {
      throw new Error("Erro ao obter dados do time.");
    }
    return response.json();
  },

  /**
   * Adiciona um Pokémon à lista de capturados (reserva).
   */
  async addCaptured(userId: string, pokemonId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/pokemon/v1/captured?user-id=${userId}&pokemon-id=${pokemonId}`,
      {
        method: "PUT",
        headers: {
          "Content-Length": "0",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao adicionar Pokémon capturado.");
    }
  },

  /**
   * Deleta um Pokémon da lista de capturados.
   */
  async deleteCaptured(userId: string, pokemonId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/pokemon/v1/captured?user-id=${userId}&pokemon-id=${pokemonId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao deletar Pokémon capturado.");
    }
  },

  /**
   * Substitui um Pokémon no time titular por um Pokémon capturado (reserva).
   */
  async swapTeam(userId: string, removedPokemonId: string, newPokemonId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/pokemon/v1/team?user-id=${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        removedPokemon: String(removedPokemonId),
        newPokemon: String(newPokemonId),
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || "Erro ao substituir Pokémon do time.");
    }
  },

  /**
   * Reordena o time titular de Pokémons do usuário.
   */
  async reorderTeam(userId: string, teamOrder: string[]): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/pokemon/v1/team?user-id=${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        teamOrder: teamOrder.map(String),
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || "Erro ao reordenar time.");
    }
  },
};
