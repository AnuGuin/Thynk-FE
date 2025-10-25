import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { market_id, description, image_url, proposer_address, tag } = body;

    // Validate required fields
    if (!market_id || !description || !image_url || !proposer_address || !tag) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert market details into Supabase
    const { data, error } = await supabase
      .from('markets')
      .insert([
        {
          market_id,
          description,
          image_url,
          proposer_address,
          tag,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save market details', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const market_id = searchParams.get('market_id');
    const tag = searchParams.get('tag');

    if (market_id) {
      // Get specific market by ID
      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .eq('market_id', market_id)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: 'Market not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(data, { status: 200 });
    } else if (tag) {
      // Get markets by tag
      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .eq('tag', tag)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch markets' },
          { status: 500 }
        );
      }

      return NextResponse.json(data, { status: 200 });
    } else {
      // Get all markets
      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch markets' },
          { status: 500 }
        );
      }

      return NextResponse.json(data, { status: 200 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}