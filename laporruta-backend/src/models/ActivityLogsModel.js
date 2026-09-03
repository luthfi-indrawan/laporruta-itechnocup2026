const { query } = require("../config/database");
const TABLES = require("../constants/databaseTables");

class ActivityLogsModel {
  async create(
    {
      reportId,
      actorId,
      actionType,
      oldValue,
      newValue,
      metadata,
      isOverride = false,
    },
    client,
  ) {
    const q = client ? client.query.bind(client) : query;
    const result = await q(
      `INSERT INTO ${TABLES.ACTIVITY_LOGS}
       (report_id, actor_id, action_type, old_value, new_value, metadata, is_override)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        reportId,
        actorId,
        actionType,
        oldValue,
        newValue,
        metadata ? JSON.stringify(metadata) : null,
        isOverride,
      ],
    );
    return result.rows[0];
  }

  async findByReportId(reportId) {
    const result = await query(
      `SELECT al.id, al.action_type, al.old_value, al.new_value, al.metadata, al.is_override, al.created_at,
              u.full_name as actor_name
       FROM ${TABLES.ACTIVITY_LOGS} al
       LEFT JOIN ${TABLES.USERS} u ON al.actor_id = u.id
       WHERE al.report_id = $1
       ORDER BY al.created_at DESC`,
      [reportId],
    );

    // Aggregate upvotes per week
    const upvoteLogs = result.rows.filter(
      (r) =>
        r.action_type === "upvote_added" || r.action_type === "upvote_removed",
    );
    const otherLogs = result.rows.filter(
      (r) =>
        r.action_type !== "upvote_added" && r.action_type !== "upvote_removed",
    );

    const aggregated = [];
    const weekMap = new Map();

    for (const log of upvoteLogs) {
      const date = new Date(log.created_at);
      const year = date.getFullYear();
      const week = Math.ceil(
        ((date - new Date(year, 0, 1)) / 86400000 +
          new Date(year, 0, 1).getDay() +
          1) /
          7,
      );
      const key = `${year}-W${week}`;

      if (!weekMap.has(key)) {
        weekMap.set(key, { count: 0, created_at: log.created_at });
      }
      weekMap.get(key).count += log.action_type === "upvote_added" ? 1 : -1;
    }

    for (const [key, val] of weekMap) {
      if (val.count > 0) {
        aggregated.push({
          id: `agg-${key}`,
          action_type: "upvote_aggregated",
          actor_name: null,
          metadata: { week: key, count: val.count },
          created_at: val.created_at,
        });
      }
    }

    return [...otherLogs, ...aggregated].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
  }
}

module.exports = new ActivityLogsModel();
