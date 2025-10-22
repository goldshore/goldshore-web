import type { ExecutionContext, KVNamespace } from '@cloudflare/workers-types';

export type AgentBindings = {
  AGENT_SYSTEM_PROMPT?: string;
  AGENT_PROMPT_KV?: KVNamespace;
  ASSETS: {
    fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
  };
};

export async function loadSystemPrompt(
  ctx: ExecutionContext,
  bindings: AgentBindings,
): Promise<string> {
  void ctx;

  if (bindings.AGENT_SYSTEM_PROMPT) {
    return bindings.AGENT_SYSTEM_PROMPT;
  }

  if (bindings.AGENT_PROMPT_KV) {
    const kvText = await bindings.AGENT_PROMPT_KV.get('prompt.md');
    if (kvText) {
      return kvText;
    }
  }

  try {
    const res = await bindings.ASSETS.fetch(new URL('/agent/prompt.md', 'http://assets'));
    if (res.ok) {
      return await res.text();
    }
  } catch (_) {
    // ignore asset fetch errors and fall back to the default prompt
  }

  return 'Gold Shore Labs — system prompt not found.';
}
