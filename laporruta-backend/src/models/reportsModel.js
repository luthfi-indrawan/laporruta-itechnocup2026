const { query, getClient } = require("../config/database");
const TABLES = require("../constants/databaseTables");

class ReportsModel {
  // ─── Public Queries ───

  async findPublic({
    status,
    categoryIds,
    wilayahId,
    dateFrom,
    dateTo,
    keyword,
    lat,
    lng,
    radius,
    page,
    limit,
  }) {
    const conditions = [`r.status IN ('verified', 'in_progress', 'resolved')`];
    const params = [];
    let idx = 1;

    if (status?.length) {
      conditions.push(`r.status = ANY($${idx++})`);
      params.push(status);
    }
    if (categoryIds?.length) {
      conditions.push(`r.category_id = ANY($${idx++})`);
      params.push(categoryIds);
    }
    if (wilayahId) {
      conditions.push(`r.wilayah_id = $${idx++}`);
      params.push(wilayahId);
    }
    if (dateFrom && dateTo) {
      conditions.push(`r.created_at BETWEEN $${idx++} AND $${idx++}`);
      params.push(dateFrom, dateTo);
    }
    if (keyword) {
      conditions.push(
        `(r.title ILIKE $${idx++} OR r.description ILIKE $${idx++})`,
      );
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (lat && lng && radius) {
      const deltaLat = radius / 111320;
      const deltaLng = radius / (111320 * Math.cos((lat * Math.PI) / 180));
      conditions.push(`r.lat BETWEEN $${idx++} AND $${idx++}`);
      conditions.push(`r.lng BETWEEN $${idx++} AND $${idx++}`);
      params.push(
        lat - deltaLat,
        lat + deltaLat,
        lng - deltaLng,
        lng + deltaLng,
      );
    }

    const where = conditions.join(" AND ");
    const offset = (page - 1) * limit;

    const sql = `
      SELECT r.id, r.title, r.status, r.lat, r.lng, r.address_text, r.created_at, r.updated_at,
             c.id as category_id, c.name as category_name, c.color as category_color, c.icon as category_icon,
             COALESCE(u.upvote_count, 0) as upvote_count,
             (SELECT image_url FROM ${TABLES.REPORT_IMAGES} WHERE report_id = r.id ORDER BY created_at LIMIT 1) as thumbnail_url
      FROM ${TABLES.REPORTS} r
      JOIN ${TABLES.CATEGORIES} c ON r.category_id = c.id
      LEFT JOIN (
        SELECT report_id, COUNT(*) as upvote_count
        FROM ${TABLES.UPVOTES}
        GROUP BY report_id
      ) u ON u.report_id = r.id
      WHERE ${where}
      ORDER BY r.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    const countSql = `
      SELECT COUNT(*) as total
      FROM ${TABLES.REPORTS} r
      WHERE ${where}
    `;

    const [dataResult, countResult] = await Promise.all([
      query(sql, [...params, limit, offset]),
      query(countSql, params),
    ]);

    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  }

  async findPublicById(id) {
    const result = await query(
      `
    SELECT
      r.id,
      r.title,
      r.description,
      r.status,
      r.address_text,
      r.lat,
      r.lng,
      r.created_at,
      r.updated_at,

      -- Category
      json_build_object(
        'id', c.id,
        'name', c.name,
        'color', c.color,
        'icon', c.icon
      ) AS category,

      -- Wilayah
      json_build_object(
        'id', w.id,
        'name', w.name,
        'type', w.type
      ) AS wilayah,

      -- Upvote
      COALESCE(
        (
          SELECT COUNT(*)
          FROM ${TABLES.UPVOTES} u
          WHERE u.report_id = r.id
        ),
        0
      ) AS upvote_count,

      -- Images
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', ri.id,
              'image_url', ri.image_url,
              'is_after', ri.is_after
            )
            ORDER BY ri.created_at ASC
          )
          FROM ${TABLES.REPORT_IMAGES} ri
          WHERE ri.report_id = r.id
        ),
        '[]'::json
      ) AS images,

      -- Timeline
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', al.id,
              'action_type', al.action_type,
              'actor_name', actor.full_name,
              'old_value', al.old_value,
              'new_value', al.new_value,
              'is_override', al.is_override,
              'created_at', al.created_at
            )
            ORDER BY al.created_at ASC
          )
          FROM ${TABLES.ACTIVITY_LOGS} al
          LEFT JOIN ${TABLES.USERS} actor
            ON actor.id = al.actor_id
          WHERE al.report_id = r.id
        ),
        '[]'::json
      ) AS timeline

    FROM ${TABLES.REPORTS} r

    INNER JOIN ${TABLES.CATEGORIES} c
      ON c.id = r.category_id

    INNER JOIN ${TABLES.WILAYAH} w
      ON w.id = r.wilayah_id

    WHERE
      r.id = $1
      AND r.status IN ('verified', 'in_progress', 'resolved')

    LIMIT 1
    `,
      [id],
    );

    return result.rows[0] || null;
  }

  async findNearby({ lat, lng, categoryId, radius, days }) {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const deltaLat = radius / 111320;
    const deltaLng = radius / (111320 * Math.cos((lat * Math.PI) / 180));

    const result = await query(
      `SELECT r.id, r.title, r.lat, r.lng, r.created_at,
              (SELECT image_url FROM ${TABLES.REPORT_IMAGES} WHERE report_id = r.id ORDER BY created_at LIMIT 1) as thumbnail_url
       FROM ${TABLES.REPORTS} r
       WHERE r.category_id = $1
         AND r.status IN ('verified', 'in_progress', 'resolved')
         AND r.created_at >= $2
         AND r.lat BETWEEN $3 AND $4
         AND r.lng BETWEEN $5 AND $6`,
      [
        categoryId,
        since,
        lat - deltaLat,
        lat + deltaLat,
        lng - deltaLng,
        lng + deltaLng,
      ],
    );

    return result.rows;
  }

  // ─── Authenticated Queries ───

  async create(
    {
      userId,
      title,
      description,
      categoryId,
      wilayahId,
      address_text,
      lat,
      lng,
    },
    client,
  ) {
    const q = client ? client.query.bind(client) : query;
    const result = await q(
      `INSERT INTO ${TABLES.REPORTS}
       (user_id, title, description, category_id, wilayah_id, address_text, lat, lng, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending_verification')
       RETURNING *`,
      [
        userId,
        title,
        description,
        categoryId,
        wilayahId,
        address_text,
        lat || null,
        lng || null,
      ],
    );
    return result.rows[0];
  }

  async findByUserId(userId, { page, limit }) {
    const offset = (page - 1) * limit;
    const result = await query(
      `SELECT r.id, r.title, r.status, r.created_at, r.updated_at,
              c.name as category_name, c.icon as category_icon, c.color as category_color,
              COALESCE(u.upvote_count, 0) as upvote_count,
              (SELECT image_url FROM ${TABLES.REPORT_IMAGES} WHERE report_id = r.id ORDER BY created_at LIMIT 1) as thumbnail_url
       FROM ${TABLES.REPORTS} r
       JOIN ${TABLES.CATEGORIES} c ON r.category_id = c.id
       LEFT JOIN (
         SELECT report_id, COUNT(*) as upvote_count FROM ${TABLES.UPVOTES} GROUP BY report_id
       ) u ON u.report_id = r.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM ${TABLES.REPORTS} WHERE user_id = $1`,
      [userId],
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  }

  async findById(id) {
    const result = await query(
      `
      SELECT
        r.*,

        c.id AS category_id,
        c.name AS category_name,
        c.color AS category_color,
        c.icon AS category_icon,
        c.urgency_weight,

        w.id AS wilayah_id,
        w.name AS wilayah_name,
        w.type AS wilayah_type,

        COALESCE(uv.upvote_count, 0) AS upvote_count,

        ROUND(
          (
            (COALESCE(uv.upvote_count, 0) * 3)
            + (c.urgency_weight * 5)
            + (
              CASE
                WHEN r.lat IS NOT NULL
                AND r.lng IS NOT NULL
                THEN 2
                ELSE 0
              END
            )
            - (
              EXTRACT(
                EPOCH FROM (NOW() - r.created_at)
              ) / 86400 * 0.5
            )
          )::numeric,
          2
        ) AS priority_score

      FROM ${TABLES.REPORTS} r

      INNER JOIN ${TABLES.CATEGORIES} c
        ON r.category_id = c.id

      INNER JOIN ${TABLES.WILAYAH} w
        ON r.wilayah_id = w.id

      LEFT JOIN (
        SELECT
          report_id,
          COUNT(*) AS upvote_count
        FROM ${TABLES.UPVOTES}
        GROUP BY report_id
      ) uv
        ON uv.report_id = r.id

      WHERE r.id = $1

      LIMIT 1
    `,
      [id],
    );

    return result.rows[0] || null;
  }

  async findByIdAndUserId(id, userId) {
    const result = await query(
      `
    SELECT
      r.id,
      r.title,
      r.description,
      r.address_text,
      r.lat,
      r.lng,
      r.status,
      r.created_at,
      r.updated_at,

      c.id AS category_id,
      c.name AS category_name,
      c.color AS category_color,
      c.icon AS category_icon,

      w.id AS wilayah_id,
      w.name AS wilayah_name,
      w.type AS wilayah_type

    FROM ${TABLES.REPORTS} r

    INNER JOIN ${TABLES.CATEGORIES} c
      ON c.id = r.category_id

    INNER JOIN ${TABLES.WILAYAH} w
      ON w.id = r.wilayah_id

    WHERE
      r.id = $1
      AND r.user_id = $2

    LIMIT 1
    `,
      [id, userId],
    );

    return result.rows[0] || null;
  }

  // ─── Admin Queries ───

  async findForAdmin({
    wilayahId,
    status,
    categoryId,
    sort = "priority",
    page,
    limit,
  }) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (wilayahId) {
      conditions.push(`r.wilayah_id = $${paramIndex}`);
      params.push(wilayahId);
      paramIndex++;
    }

    if (status) {
      conditions.push(`r.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (categoryId) {
      conditions.push(`r.category_id = $${paramIndex}`);
      params.push(categoryId);
      paramIndex++;
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    let orderBy;

    switch (sort) {
      case "newest":
        orderBy = "r.created_at DESC";
        break;

      case "oldest":
        orderBy = "r.created_at ASC";
        break;

      case "upvotes":
        orderBy = "upvote_count DESC";
        break;

      case "priority":
      default:
        orderBy = "priority_score DESC";
        break;
    }

    const offset = (page - 1) * limit;

    const limitParam = paramIndex++;
    const offsetParam = paramIndex++;

    const sql = `
    SELECT
      r.id,
      r.title,
      r.status,
      r.created_at,
      r.updated_at,

      c.name AS category_name,
      c.icon AS category_icon,
      c.color AS category_color,
      c.urgency_weight,

      u.full_name AS reporter_name,

      COALESCE(uv.upvote_count, 0) AS upvote_count,

      COALESCE(cm.comment_count, 0) AS comment_count,

      ri.thumbnail_url,

      (
        (COALESCE(uv.upvote_count, 0) * 3)
        + (c.urgency_weight * 5)
        + (
          CASE
            WHEN r.lat IS NOT NULL
             AND r.lng IS NOT NULL
            THEN 2
            ELSE 0
          END
        )
        - (
          EXTRACT(
            EPOCH FROM (NOW() - r.created_at)
          ) / 86400 * 0.5
        )
      ) AS priority_score,

      false AS is_unread

    FROM ${TABLES.REPORTS} r

    INNER JOIN ${TABLES.CATEGORIES} c
      ON c.id = r.category_id

    INNER JOIN ${TABLES.USERS} u
      ON u.id = r.user_id

    LEFT JOIN (
      SELECT
        report_id,
        COUNT(*) AS upvote_count
      FROM ${TABLES.UPVOTES}
      GROUP BY report_id
    ) uv
      ON uv.report_id = r.id

    LEFT JOIN (
      SELECT
        report_id,
        COUNT(*) AS comment_count
      FROM ${TABLES.COMMENTS}
      GROUP BY report_id
    ) cm
      ON cm.report_id = r.id

    LEFT JOIN LATERAL (
      SELECT
        image_url AS thumbnail_url
      FROM ${TABLES.REPORT_IMAGES}
      WHERE report_id = r.id
        AND is_after = false
      ORDER BY created_at ASC
      LIMIT 1
    ) ri
      ON true

    ${whereClause}

    ORDER BY ${orderBy}

    LIMIT $${limitParam}
    OFFSET $${offsetParam}
  `;

    const countSql = `
    SELECT COUNT(*) AS total
    FROM ${TABLES.REPORTS} r
    ${whereClause}
  `;

    const dataParams = [...params, limit, offset];

    const [dataResult, countResult] = await Promise.all([
      query(sql, dataParams),
      query(countSql, params),
    ]);

    return {
      data: dataResult.rows,
      total: Number(countResult.rows[0]?.total || 0),
    };
  }

  async findZonelessPending() {
    const result = await query(
      `SELECT r.id, r.title, r.status, r.created_at, r.address_text,
              c.name as category_name, c.color as category_color,
              w.name as wilayah_name, w.type as wilayah_type,
              u.full_name as reporter_name
       FROM ${TABLES.REPORTS} r
       JOIN ${TABLES.CATEGORIES} c ON r.category_id = c.id
       JOIN ${TABLES.WILAYAH} w ON r.wilayah_id = w.id
       JOIN ${TABLES.USERS} u ON r.user_id = u.id
       WHERE r.status = 'pending_verification'
         AND NOT EXISTS (
           SELECT 1 FROM ${TABLES.USERS}
           WHERE role = 'admin_wilayah'
             AND assigned_wilayah_id = r.wilayah_id
             AND is_active = true
         )
       ORDER BY r.created_at DESC`,
    );
    return result.rows;
  }

  async updateStatus(id, status, rejectionReason, client) {
    const q = client ? client.query.bind(client) : query;
    const result = await q(
      `UPDATE ${TABLES.REPORTS}
       SET status = $2, rejection_reason = $3, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, status, rejectionReason || null],
    );
    return result.rows[0];
  }

  async updateWilayah(id, wilayahId, client) {
    const q = client ? client.query.bind(client) : query;
    const result = await q(
      `UPDATE ${TABLES.REPORTS} SET wilayah_id = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, wilayahId],
    );
    return result.rows[0];
  }

  async updateMetadata(
    id,
    { title, description, category_id, address_text },
    client,
  ) {
    const q = client ? client.query.bind(client) : query;
    const result = await q(
      `UPDATE ${TABLES.REPORTS}
       SET title = $2, description = $3, category_id = $4, address_text = $5, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, title, description, category_id, address_text],
    );
    return result.rows[0];
  }

  async getStats() {
    const result = await query(
      `SELECT
        COUNT(*) as total_reports,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400)
          FILTER (WHERE status = 'resolved') as avg_resolution_days,
        COUNT(*) FILTER (WHERE status = 'pending_verification') as pending_verification,
        COUNT(*) FILTER (WHERE status = 'verified') as verified,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected
       FROM ${TABLES.REPORTS}`,
    );

    const topCategories = await query(
      `SELECT c.name as category, COUNT(*) as count
       FROM ${TABLES.REPORTS} r
       JOIN ${TABLES.CATEGORIES} c ON r.category_id = c.id
       GROUP BY c.name
       ORDER BY count DESC
       LIMIT 5`,
    );

    const row = result.rows[0];
    const total = parseInt(row.total_reports, 10);
    const resolved = parseInt(row.resolved_count, 10);

    return {
      total_reports: total,
      resolution_rate:
        total > 0 ? parseFloat(((resolved / total) * 100).toFixed(1)) : 0,
      avg_resolution_days: row.avg_resolution_days
        ? parseFloat(parseFloat(row.avg_resolution_days).toFixed(1))
        : 0,
      status_breakdown: {
        pending_verification: parseInt(row.pending_verification, 10),
        verified: parseInt(row.verified, 10),
        in_progress: parseInt(row.in_progress, 10),
        resolved: resolved,
        rejected: parseInt(row.rejected, 10),
      },
      top_categories: topCategories.rows,
    };
  }

  async getHeatmapData() {
    const result = await query(
      `SELECT r.lat, r.lng, COALESCE(u.upvote_count, 0) + 1 as intensity
       FROM ${TABLES.REPORTS} r
       LEFT JOIN (
         SELECT report_id, COUNT(*) as upvote_count FROM ${TABLES.UPVOTES} GROUP BY report_id
       ) u ON u.report_id = r.id
       WHERE r.status IN ('verified', 'in_progress', 'resolved')
         AND r.lat IS NOT NULL AND r.lng IS NOT NULL`,
    );
    return result.rows;
  }

  async getExportData({ status, categoryId, wilayahId, dateFrom, dateTo }) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (status) {
      conditions.push(`r.status = $${idx++}`);
      params.push(status);
    }
    if (categoryId) {
      conditions.push(`r.category_id = $${idx++}`);
      params.push(categoryId);
    }
    if (wilayahId) {
      conditions.push(`r.wilayah_id = $${idx++}`);
      params.push(wilayahId);
    }
    if (dateFrom && dateTo) {
      conditions.push(`r.created_at BETWEEN $${idx++} AND $${idx++}`);
      params.push(dateFrom, dateTo);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await query(
      `SELECT r.id, r.title, r.description, r.status, r.address_text, r.lat, r.lng,
              r.created_at, r.updated_at, r.rejection_reason,
              c.name as category_name, c.urgency_weight,
              w.name as wilayah_name, w.type as wilayah_type,
              u.full_name as reporter_name,
              COALESCE(uv.upvote_count, 0) as upvote_count
       FROM ${TABLES.REPORTS} r
       JOIN ${TABLES.CATEGORIES} c ON r.category_id = c.id
       JOIN ${TABLES.WILAYAH} w ON r.wilayah_id = w.id
       JOIN ${TABLES.USERS} u ON r.user_id = u.id
       LEFT JOIN (
         SELECT report_id, COUNT(*) as upvote_count FROM ${TABLES.UPVOTES} GROUP BY report_id
       ) uv ON uv.report_id = r.id
       ${where}
       ORDER BY r.created_at DESC`,
      params,
    );
    return result.rows;
  }
}

module.exports = new ReportsModel();
