import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Helper to get OAuth2 client
function getOAuth2Client(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ access_token: accessToken });
  return oauth2Client;
}

// Helper to get access token from session or header
async function getAccessToken(request: NextRequest): Promise<string | null> {
  // First try from header
  const headerToken = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (headerToken) return headerToken;

  // Fallback to session
  const session = await getServerSession(authOptions);
  return session?.accessToken || null;
}

// GET - Fetch calendar events
export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessToken(request);
    
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get("timeMin") || new Date().toISOString();
    const timeMax = searchParams.get("timeMax") || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const maxResults = parseInt(searchParams.get("maxResults") || "10");
    const query = searchParams.get("q") || "";

    const oauth2Client = getOAuth2Client(accessToken);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin,
      timeMax,
      maxResults,
      singleEvents: true,
      orderBy: "startTime",
      q: query || undefined,
    });

    // Return events in the format expected by the component
    const events = response.data.items?.map((event) => ({
      id: event.id,
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.start?.dateTime,
        date: event.start?.date,
        timeZone: event.start?.timeZone,
      },
      end: {
        dateTime: event.end?.dateTime,
        date: event.end?.date,
        timeZone: event.end?.timeZone,
      },
      colorId: event.colorId,
      htmlLink: event.htmlLink,
      // Legacy fields for backward compatibility
      title: event.summary,
      link: event.htmlLink,
      status: event.status,
      attendees: event.attendees?.map((a) => ({
        email: a.email,
        name: a.displayName,
        status: a.responseStatus,
      })),
    })) || [];

    return NextResponse.json({
      success: true,
      events,
      total: events.length,
    });
  } catch (error: any) {
    console.error("Calendar GET error:", error);
    
    if (error.code === 401) {
      return NextResponse.json({ error: "Token expired. Please re-authenticate." }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST - Create new calendar event
export async function POST(request: NextRequest) {
  try {
    const accessToken = await getAccessToken(request);
    
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { summary, title, description, start, end, startTime, endTime, location, attendees } = body;

    // Support both old format (title, startTime) and new format (summary, start)
    const eventTitle = summary || title;
    const eventStart = start?.dateTime || startTime;
    const eventEnd = end?.dateTime || endTime;

    if (!eventTitle || !eventStart) {
      return NextResponse.json(
        { error: "Title and start time are required" },
        { status: 400 }
      );
    }

    const oauth2Client = getOAuth2Client(accessToken);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Calculate end time if not provided (default 1 hour)
    const startDate = new Date(eventStart);
    const endDate = eventEnd ? new Date(eventEnd) : new Date(startDate.getTime() + 60 * 60 * 1000);

    const event = {
      summary: eventTitle,
      description: description || "",
      location: location || "",
      start: {
        dateTime: startDate.toISOString(),
        timeZone: start?.timeZone || "Asia/Jakarta",
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: end?.timeZone || "Asia/Jakarta",
      },
      attendees: attendees?.map((email: string) => ({ email })) || [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 30 },
          { method: "email", minutes: 60 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      sendUpdates: attendees?.length ? "all" : "none",
    });

    return NextResponse.json({
      success: true,
      event: {
        id: response.data.id,
        title: response.data.summary,
        link: response.data.htmlLink,
        start: response.data.start?.dateTime,
        end: response.data.end?.dateTime,
      },
    });
  } catch (error: any) {
    console.error("Calendar POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create event" },
      { status: 500 }
    );
  }
}

// DELETE - Delete calendar event
export async function DELETE(request: NextRequest) {
  try {
    const accessToken = await getAccessToken(request);
    
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const oauth2Client = getOAuth2Client(accessToken);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    await calendar.events.delete({
      calendarId: "primary",
      eventId,
    });

    return NextResponse.json({ success: true, message: "Event deleted" });
  } catch (error: any) {
    console.error("Calendar DELETE error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete event" },
      { status: 500 }
    );
  }
}

// PUT - Update calendar event
export async function PUT(request: NextRequest) {
  try {
    const accessToken = await getAccessToken(request);
    
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { eventId, summary, description, location, start, end } = body;

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const oauth2Client = getOAuth2Client(accessToken);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event: any = {};
    if (summary) event.summary = summary;
    if (description !== undefined) event.description = description;
    if (location !== undefined) event.location = location;
    if (start) {
      event.start = {
        dateTime: new Date(start.dateTime).toISOString(),
        timeZone: start.timeZone || "Asia/Jakarta",
      };
    }
    if (end) {
      event.end = {
        dateTime: new Date(end.dateTime).toISOString(),
        timeZone: end.timeZone || "Asia/Jakarta",
      };
    }

    const response = await calendar.events.patch({
      calendarId: "primary",
      eventId,
      requestBody: event,
    });

    return NextResponse.json({
      success: true,
      event: {
        id: response.data.id,
        summary: response.data.summary,
        description: response.data.description,
        location: response.data.location,
        start: response.data.start,
        end: response.data.end,
        htmlLink: response.data.htmlLink,
      },
    });
  } catch (error: any) {
    console.error("Calendar PUT error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update event" },
      { status: 500 }
    );
  }
}
