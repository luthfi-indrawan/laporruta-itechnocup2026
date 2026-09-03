const reportsModel = require("../models/reportsModel");
const MESSAGES = require("../constants/errorMessages");
const commentsModel = require("../models/commentsModel");
const HTTP_STATUS = require("../constants/httpStatus");

class ReportsPublicService {
  async getPublicReports(filters) {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;

    const { data } = await reportsModel.findPublic({
      status: filters.status ? filters.status.split(",") : null,
      categoryIds: filters.category_id ? filters.category_id.split(",") : null,
      wilayahId: filters.wilayah_id,
      dateFrom: filters.date_from,
      dateTo: filters.date_to,
      keyword: filters.keyword,
      lat: filters.lat ? parseFloat(filters.lat) : null,
      lng: filters.lng ? parseFloat(filters.lng) : null,
      radius: filters.radius ? parseInt(filters.radius, 10) : 5000,
      page,
      limit,
    });

    const formattedData = await Promise.all(
      data.map(async (report) => ({
        id: report.id,
        title: report.title,
        status: report.status,

        lat: report.lat !== null ? parseFloat(report.lat) : null,
        lng: report.lng !== null ? parseFloat(report.lng) : null,

        category: {
          id: report.category_id,
          name: report.category_name,
          color: report.category_color,
          icon: report.category_icon,
        },

        upvote_count: parseInt(report.upvote_count, 10) || 0,

        comment_count:
          (await commentsModel.getCountForReport({
            reportId: report.id,
          })) || 0,

        thumbnail_url: report.thumbnail_url,
        updated_at: report.updated_at,
      })),
    );

    return {
      data: formattedData,
    };
  }

  async getPublicReportDetail(id) {
    const report = await reportsModel.findPublicById(id);

    const [comments] = await Promise.all([
      commentsModel.findByReportId(id, {
        page: 1,
        limit: 100,
      }),
    ]);

    if (!report) {
      const err = new Error(MESSAGES.REPORT.NOT_PUBLIC);
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      throw err;
    }

    return {
      ...report,
      lat: report.lat !== null ? parseFloat(report.lat) : null,
      lng: report.lng !== null ? parseFloat(report.lng) : null,
      upvote_count: parseInt(report.upvote_count, 10) || 0,
      comments: comments.data,
      comment_count: comments.data.length,
    };
  }

  async getNearby({ lat, lng, category_id, radius, days }) {
    const reports = await reportsModel.findNearby({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      categoryId: category_id,
      radius: radius ? parseInt(radius, 10) : 100,
      days: days ? parseInt(days, 10) : 7,
    });

    // Haversine filter for accuracy
    const R = 6371e3;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const filtered = reports
      .map((r) => {
        const dLat = toRad(r.lat - lat);
        const dLng = toRad(r.lng - lng);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(lat)) *
            Math.cos(toRad(r.lat)) *
            Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return { ...r, distance_meters: Math.round(distance) };
      })
      .filter((r) => r.distance_meters <= (radius || 100));

    return filtered.sort((a, b) => a.distance_meters - b.distance_meters);
  }
}

module.exports = new ReportsPublicService();
