import { getCountryFromCoords } from '@/lib/geo';

const CALLING_CODE_BY_COUNTRY = {
  IN: '+91',
  US: '+1',
  CA: '+1',
  GB: '+44',
  AU: '+61',
  NZ: '+64',
  AE: '+971',
  SA: '+966',
  SG: '+65',
  BD: '+880',
  PK: '+92',
  LK: '+94',
  NP: '+977',
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return new Response(JSON.stringify({ success: false, message: 'Latitude and longitude are required' }), { status: 400 });
  }

  try {
    const country = await getCountryFromCoords({ lat, lon });
    const callingCode = CALLING_CODE_BY_COUNTRY[country] || '+91';

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          country,
          callingCode,
          isFallback: !CALLING_CODE_BY_COUNTRY[country],
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/geo/calling-code:', error);
    return new Response(JSON.stringify({ success: false, message: 'Server Error' }), { status: 500 });
  }
}
