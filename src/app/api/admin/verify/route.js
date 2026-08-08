export async function POST(request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return new Response(
        JSON.stringify({ success: false, message: 'Admin password not configured.' }),
        { status: 500 }
      );
    }

    if (!password || password !== adminPassword) {
      return new Response(
        JSON.stringify({ success: false, message: 'Incorrect password.' }),
        { status: 401 }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: 'Server error.' }),
      { status: 500 }
    );
  }
}
