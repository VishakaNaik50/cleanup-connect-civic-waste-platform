import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reports } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

const ALLOWED_WASTE_TYPES = ['plastic', 'organic', 'metal', 'electronic', 'mixed', 'hazardous'];
const ALLOWED_SEVERITIES = ['low', 'medium', 'high', 'critical'];
const ALLOWED_STATUSES = ['submitted', 'assigned', 'in_progress', 'resolved', 'rejected'];
const ALLOWED_BIODEGRADABLE = ['biodegradable', 'non-biodegradable'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single report by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const report = await db
        .select()
        .from(reports)
        .where(eq(reports.id, parseInt(id)))
        .limit(1);

      if (report.length === 0) {
        return NextResponse.json(
          { error: 'Report not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(report[0], { status: 200 });
    }

    // List with filters and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const municipality = searchParams.get('municipality');
    const assignedTeamId = searchParams.get('assignedTeamId');

    let query = db.select().from(reports);

    // Build filter conditions
    const conditions = [];

    if (userId) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json(
          { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(reports.userId, parseInt(userId)));
    }

    if (status) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return NextResponse.json(
          { 
            error: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}`, 
            code: 'INVALID_STATUS' 
          },
          { status: 400 }
        );
      }
      conditions.push(eq(reports.status, status));
    }

    if (severity) {
      if (!ALLOWED_SEVERITIES.includes(severity)) {
        return NextResponse.json(
          { 
            error: `Invalid severity. Must be one of: ${ALLOWED_SEVERITIES.join(', ')}`, 
            code: 'INVALID_SEVERITY' 
          },
          { status: 400 }
        );
      }
      conditions.push(eq(reports.severity, severity));
    }

    if (municipality) {
      conditions.push(eq(reports.assignedMunicipality, municipality));
    }

    if (assignedTeamId) {
      if (isNaN(parseInt(assignedTeamId))) {
        return NextResponse.json(
          { error: 'Valid assignedTeamId is required', code: 'INVALID_TEAM_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(reports.assignedTeamId, parseInt(assignedTeamId)));
    }

    // Apply filters
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Sort by newest first and apply pagination
    const results = await query
      .orderBy(desc(reports.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      photoUrl, 
      location, 
      wasteType,
      biodegradable,
      severity, 
      description, 
      priorityScore 
    } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (typeof userId !== 'number' || isNaN(userId)) {
      return NextResponse.json(
        { error: 'userId must be a valid integer', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    if (!photoUrl || typeof photoUrl !== 'string' || photoUrl.trim() === '') {
      return NextResponse.json(
        { error: 'photoUrl is required and must be a non-empty string', code: 'MISSING_PHOTO_URL' },
        { status: 400 }
      );
    }

    if (!location || typeof location !== 'object') {
      return NextResponse.json(
        { error: 'location is required and must be an object', code: 'MISSING_LOCATION' },
        { status: 400 }
      );
    }

    if (!location.lat || !location.lng || !location.address) {
      return NextResponse.json(
        { error: 'location must contain lat, lng, and address', code: 'INVALID_LOCATION' },
        { status: 400 }
      );
    }

    if (!wasteType || typeof wasteType !== 'string' || wasteType.trim() === '') {
      return NextResponse.json(
        { error: 'wasteType is required', code: 'MISSING_WASTE_TYPE' },
        { status: 400 }
      );
    }

    if (!ALLOWED_WASTE_TYPES.includes(wasteType)) {
      return NextResponse.json(
        { 
          error: `wasteType must be one of: ${ALLOWED_WASTE_TYPES.join(', ')}`, 
          code: 'INVALID_WASTE_TYPE' 
        },
        { status: 400 }
      );
    }

    if (!biodegradable || typeof biodegradable !== 'string' || biodegradable.trim() === '') {
      return NextResponse.json(
        { error: 'biodegradable is required', code: 'MISSING_BIODEGRADABLE' },
        { status: 400 }
      );
    }

    if (!ALLOWED_BIODEGRADABLE.includes(biodegradable)) {
      return NextResponse.json(
        { 
          error: `biodegradable must be one of: ${ALLOWED_BIODEGRADABLE.join(', ')}`, 
          code: 'INVALID_BIODEGRADABLE' 
        },
        { status: 400 }
      );
    }

    if (!severity || typeof severity !== 'string' || severity.trim() === '') {
      return NextResponse.json(
        { error: 'severity is required', code: 'MISSING_SEVERITY' },
        { status: 400 }
      );
    }

    if (!ALLOWED_SEVERITIES.includes(severity)) {
      return NextResponse.json(
        { 
          error: `severity must be one of: ${ALLOWED_SEVERITIES.join(', ')}`, 
          code: 'INVALID_SEVERITY' 
        },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return NextResponse.json(
        { error: 'description is required and must be a non-empty string', code: 'MISSING_DESCRIPTION' },
        { status: 400 }
      );
    }

    if (!priorityScore || typeof priorityScore !== 'number') {
      return NextResponse.json(
        { error: 'priorityScore is required and must be a number', code: 'MISSING_PRIORITY_SCORE' },
        { status: 400 }
      );
    }

    if (priorityScore < 1 || priorityScore > 100) {
      return NextResponse.json(
        { error: 'priorityScore must be between 1 and 100', code: 'INVALID_PRIORITY_SCORE' },
        { status: 400 }
      );
    }

    // Create new report
    const now = new Date().toISOString();
    const newReport = await db
      .insert(reports)
      .values({
        userId,
        photoUrl: photoUrl.trim(),
        location: JSON.stringify(location),
        wasteType: wasteType.trim(),
        biodegradable: biodegradable.trim(),
        severity: severity.trim(),
        description: description.trim(),
        priorityScore,
        status: 'submitted',
        assignedTo: null,
        assignedMunicipality: null,
        resolvedAt: null,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json(newReport[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}