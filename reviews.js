
/*
=========================================================
Review Service - Demo localStorage
=========================================================
รองรับรีวิวทั้งสถานที่และร้านค้า
ผู้ใช้ 1 คน รีวิวร้านเดิมได้ 1 รีวิว
ส่งใหม่ = อัปเดตรีวิวเดิม
=========================================================
*/

const ReviewService = (() => {
  const KEY = "travel_demo_reviews";

  function all() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  }

  function save(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  function get(targetType, targetId) {
    return all()
      .filter(review =>
        review.targetType === targetType &&
        review.targetId === targetId
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );
  }

  function findMine(targetType, targetId) {
    const user = AuthService.getCurrentUser();
    if (!user) return null;

    return all().find(review =>
      review.targetType === targetType &&
      review.targetId === targetId &&
      review.userId === user.id
    ) || null;
  }

  function add({
    targetType,
    targetId,
    rating,
    text
  }) {
    const user = AuthService.getCurrentUser();

    if (!user) {
      throw new Error("LOGIN_REQUIRED");
    }

    const numericRating = Number(rating);

    if (
      !Number.isFinite(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      throw new Error("INVALID_RATING");
    }

    const list = all();

    const index = list.findIndex(review =>
      review.targetType === targetType &&
      review.targetId === targetId &&
      review.userId === user.id
    );

    const now = new Date().toISOString();

    const review = {
      id:
        index >= 0
          ? list[index].id
          : `review_${Date.now()}_${Math.floor(Math.random()*1000)}`,

      targetType,
      targetId,
      userId: user.id,
      username: user.username || "User",
      rating: numericRating,
      text: (text || "").trim(),
      createdAt:
        index >= 0
          ? (list[index].createdAt || now)
          : now,
      updatedAt: now
    };

    if (index >= 0) {
      list[index] = review;
    } else {
      list.push(review);
    }

    save(list);
    return review;
  }

  function summary(targetType, targetId) {
    const list = get(targetType, targetId);

    if (!list.length) {
      return {
        average: null,
        count: 0
      };
    }

    const average =
      list.reduce(
        (sum, item) =>
          sum + Number(item.rating || 0),
        0
      ) / list.length;

    return {
      average: Number(average.toFixed(1)),
      count: list.length
    };
  }

  return {
    all,
    get,
    findMine,
    add,
    summary
  };
})();
