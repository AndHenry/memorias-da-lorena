import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { EmojiType } from "@/types/database"

type Params = { params: Promise<{ id: string }> }
const VALID_EMOJIS: EmojiType[] = ["heart", "star", "wow", "laugh"]

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params
  const { data, error } = await supabaseAdmin.from("media_reactions").select("emoji").eq("media_id", id)
  if (error) return NextResponse.json({ error: "Erro ao buscar reacoes." }, { status: 500 })
  const counts: Record<EmojiType, number> = { heart: 0, star: 0, wow: 0, laugh: 0 }
  for (const row of data || []) { if (VALID_EMOJIS.includes(row.emoji as EmojiType)) counts[row.emoji as EmojiType]++ }
  const reactions = VALID_EMOJIS.map((e) => ({ emoji: e, count: counts[e] })).filter(r => r.count > 0)
  return NextResponse.json({ reactions })
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params
  let body: { session_token?: string; emoji?: string } = {}
  try { body = await request.json() } catch { }
  const { session_token, emoji } = body
  if (!session_token || !emoji) return NextResponse.json({ error: "session_token e emoji sao obrigatorios." }, { status: 400 })
  if (!VALID_EMOJIS.includes(emoji as EmojiType)) return NextResponse.json({ error: "Emoji invalido." }, { status: 400 })
  const { data: media } = await supabaseAdmin.from("media").select("id, moderation_status").eq("id", id).single()
  if (!media || media.moderation_status !== "approved") return NextResponse.json({ error: "Midia nao encontrada." }, { status: 404 })
  const { error } = await supabaseAdmin.from("media_reactions").upsert({ media_id: id, session_token, emoji }, { onConflict: "media_id,session_token,emoji" })
  if (error) return NextResponse.json({ error: "Erro ao registrar reacao." }, { status: 500 })
  const { data: all } = await supabaseAdmin.from("media_reactions").select("emoji").eq("media_id", id)
  const counts: Record<EmojiType, number> = { heart: 0, star: 0, wow: 0, laugh: 0 }
  let totalReactions = 0
  for (const row of all || []) {
    if (VALID_EMOJIS.includes(row.emoji as EmojiType)) {
      counts[row.emoji as EmojiType]++
      totalReactions++
    }
  }
  // Sync media.likes_count for sorting
  await supabaseAdmin.from("media").update({ likes_count: totalReactions }).eq("id", id)

  return NextResponse.json({ success: true, counts, totalReactions })
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params
  let body: { session_token?: string; emoji?: string } = {}
  try { body = await request.json() } catch { }
  const { session_token, emoji } = body
  if (!session_token || !emoji) return NextResponse.json({ error: "session_token e emoji sao obrigatorios." }, { status: 400 })
  await supabaseAdmin.from("media_reactions").delete().eq("media_id", id).eq("session_token", session_token).eq("emoji", emoji)

  // Count remaining and update likes_count
  const { count } = await supabaseAdmin.from("media_reactions").select("id", { count: "exact", head: true }).eq("media_id", id)
  await supabaseAdmin.from("media").update({ likes_count: count ?? 0 }).eq("id", id)

  return NextResponse.json({ success: true, totalReactions: count ?? 0 })
}