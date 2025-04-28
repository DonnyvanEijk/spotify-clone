"use server"

export const sendDiscordMessage = async (message: string) => {
  try {

    if (!process.env.DISCORD_WEBHOOK_URL) {
      throw new Error("DISCORD_WEBHOOK_URL is not defined in the environment variables.");
    }

    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    });
  } catch (err: any) {
    // Just in case :)
    console.log(err.message)
  }
}
