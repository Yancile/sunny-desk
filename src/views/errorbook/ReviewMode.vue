<template>
  <div class="review-mode">
    <div class="review-header">
      <button class="close-btn" @click="$emit('close')">
        <i class="layui-icon layui-icon-close"></i>
      </button>
      <div class="progress-info">
        <span class="progress-text">{{ currentIndex + 1 }} / {{ items.length }}</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>
      <button class="edit-btn" @click="openEditModal">
        <i class="layui-icon layui-icon-edit"></i>
        编辑
      </button>
    </div>

    <div class="review-content" v-if="currentItem">
      <div class="question-section">
        <div class="section-badge">题目</div>
        <div class="question-header">
          <span class="subject-tag">{{ getSubjectIcon(currentItem.subject) }} {{ currentItem.subject }}</span>
          <span
            v-for="(type, index) in (Array.isArray(currentItem.sourceType) ? currentItem.sourceType : [currentItem.sourceType])"
            :key="index" class="source-type">{{ type }}</span>
        </div>
        <div class="source-line">
          <span v-if="currentItem.chapter" class="chapter">{{ currentItem.chapter }}</span>
          <span v-if="currentItem.problemId" class="problem-id">{{ currentItem.problemId }}</span>
        </div>

        <div v-if="currentItem.sourceImages && currentItem.sourceImages.length > 0" class="image-gallery">
          <img v-for="(img, index) in currentItem.sourceImages" :key="index" :src="img" alt="题目图片" class="gallery-image"
            @click="previewImage(img)" />
        </div>
      </div>

      <div class="sticking-section">
        <div class="section-badge orange">卡点分析</div>
        <div class="sticking-info">
          <span class="sticking-type">{{ currentItem.stickingType }}</span>
          <span class="sticking-point">{{ currentItem.stickingPoint }}</span>
        </div>
        <div v-if="currentItem.stickingAnalysis" class="analysis-content">
          {{ currentItem.stickingAnalysis }}
        </div>

        <div v-if="currentItem.stickingImages && currentItem.stickingImages.length > 0" class="image-gallery">
          <img v-for="(img, index) in currentItem.stickingImages" :key="index" :src="img" alt="卡点图片"
            class="gallery-image" @click="previewImage(img)" />
        </div>
      </div>

      <div v-if="currentItem.similarQuestions && currentItem.similarQuestions.length > 0" class="similar-section">
        <div class="section-badge blue">同类型题（{{ currentItem.similarQuestions.length }}道）</div>
        <div class="similar-list">
          <div v-for="(similar, index) in currentItem.similarQuestions" :key="index" class="similar-item">
            <div class="similar-index">{{ index + 1 }}</div>
            <div class="similar-content">
              <div class="similar-desc">{{ similar.description }}</div>
              <div class="similar-meta">
                <span>{{ similar.source }}</span>
                <span class="relation-tag">{{ similar.relation }}</span>
              </div>
              <div v-if="similar.images && similar.images.length > 0" class="similar-images">
                <img v-for="(img, imgIndex) in similar.images" :key="imgIndex" :src="img" alt="同类型题图片"
                  class="small-image" @click="previewImage(img)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentItem.tags && currentItem.tags.length > 0" class="tags-section">
        <div class="section-badge purple">标签</div>
        <div class="tags-list">
          <span v-for="tag in currentItem.tags" :key="tag" class="tag-item">{{ tag }}</span>
        </div>
      </div>

      <div class="review-footer">
        <button class="nav-btn" :class="{ disabled: currentIndex === 0 }" @click="prevItem">
          <i class="layui-icon layui-icon-left"></i>
          上一题
        </button>
        <button class="action-btn retry" @click="markRetry">
          <i class="layui-icon layui-icon-refresh"></i>
          需重做
        </button>
        <button class="action-btn mastered" @click="markMastered">
          <i class="layui-icon layui-icon-check-circle"></i>
          已掌握
        </button>
        <button class="nav-btn" :class="{ disabled: currentIndex === items.length - 1 }" @click="nextItem">
          下一题
          <i class="layui-icon layui-icon-right"></i>
        </button>
      </div>
    </div>

    <div class="review-complete" v-else>
      <div class="complete-icon">
        <i class="layui-icon layui-icon-check-circle"></i>
      </div>
      <div class="complete-title">复习完成！</div>
      <div class="complete-stats">
        <div class="stat-item">
          <span class="stat-value">{{ masteredCount }}</span>
          <span class="stat-label">已掌握</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ retryCount }}</span>
          <span class="stat-label">需重做</span>
        </div>
      </div>
      <button class="complete-btn" @click="$emit('close')">返回错题本</button>
    </div>

    <div v-if="previewImageSrc" class="image-preview-modal" @click="previewImageSrc = null">
      <img :src="previewImageSrc" alt="预览" class="preview-full-image" />
    </div>

    <ErrorForm v-if="showEditModal" :item="editingItem" @close="closeEditModal" @saved="handleEditSaved" />
  </div>
</template>

<script setup>import { ref, computed } from 'vue';
import { dataManager } from '@/utils/dataManager';
import ErrorForm from './ErrorForm.vue';
const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
});
const emit = defineEmits(['close', 'updated']);
const currentIndex = ref(0);
const masteredCount = ref(0);
const retryCount = ref(0);
const previewImageSrc = ref(null);
const showEditModal = ref(false);
const editingItem = ref(null);
const currentItem = computed(() => props.items[currentIndex.value]);
const progressPercent = computed(() => {
  return ((currentIndex.value + 1) / props.items.length) * 100;
});
const getSubjectIcon = (subjectName) => {
  const subjectBooks = dataManager.subjectBooks.getAll();
  const subject = subjectBooks.find(s => s.name === subjectName);
  return subject ? subject.icon : '📖';
};
const markMastered = () => {
  if (currentItem.value) {
    dataManager.errorbook.updateStatus(currentItem.value.id, 'mastered');
    masteredCount.value++;
    nextItem();
  }
};
const markRetry = () => {
  if (currentItem.value) {
    dataManager.errorbook.updateStatus(currentItem.value.id, 'retry');
    retryCount.value++;
    nextItem();
  }
};
const nextItem = () => {
  if (currentIndex.value < props.items.length - 1) {
    currentIndex.value++;
  }
};
const prevItem = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};
const openEditModal = () => {
  if (currentItem.value) {
    editingItem.value = { ...currentItem.value };
    showEditModal.value = true;
  }
};
const closeEditModal = () => {
  showEditModal.value = false;
  editingItem.value = null;
};
const handleEditSaved = () => {
  closeEditModal();
  const updatedItem = dataManager.errorbook.getById(currentItem.value.id);
  if (updatedItem) {
    props.items[currentIndex.value] = updatedItem;
  }
  emit('updated');
};
const previewImage = (src) => {
  previewImageSrc.value = src;
};
</script>

<style scoped>
.review-mode {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f8fafc;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.close-btn {
  width: 40px;
  height: 40px;
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e2e8f0;
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: #dbeafe;
  color: #2563eb;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: #bfdbfe;
}

.progress-info {
  flex: 1;
  margin-left: 20px;
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
  display: block;
}

.progress-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #1e4d7b 0%, #3d7ab5 100%);
  transition: width 0.3s ease;
}

.review-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.section-badge {
  display: inline-block;
  padding: 6px 14px;
  background: linear-gradient(135deg, #1e4d7b 0%, #3d7ab5 100%);
  color: #fff;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 16px;
}

.section-badge.orange {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
}

.section-badge.blue {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
}

.section-badge.purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
}

.question-section {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.question-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.subject-tag {
  padding: 4px 12px;
  background: linear-gradient(135deg, #1e4d7b 0%, #3d7ab5 100%);
  color: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
}

.source-type {
  padding: 4px 12px;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 8px;
  font-size: 13px;
}

.source-line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 16px;
}

.chapter,
.page,
.problem-id {
  padding: 2px 8px;
  background: #f8fafc;
  border-radius: 4px;
}

.image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
}

.gallery-image {
  max-width: 200px;
  max-height: 200px;
  object-fit: cover;
  border-radius: 10px;
  cursor: pointer;
  border: 2px solid #e2e8f0;
  transition: all 0.2s ease;
}

.gallery-image:hover {
  border-color: #1e4d7b;
  transform: scale(1.02);
}

.sticking-section {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.sticking-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.sticking-type {
  padding: 4px 12px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
}

.sticking-point {
  font-size: 15px;
  color: #475569;
  font-weight: 500;
}

.analysis-content {
  font-size: 14px;
  color: #334155;
  line-height: 1.6;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
}

.similar-section {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.similar-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.similar-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
}

.similar-index {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  color: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.similar-content {
  flex: 1;
}

.similar-desc {
  font-size: 14px;
  color: #334155;
  margin-bottom: 6px;
}

.similar-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #94a3b8;
}

.relation-tag {
  padding: 2px 8px;
  background: #dbeafe;
  color: #2563eb;
  border-radius: 4px;
}

.similar-images {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.small-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
}

.tags-section {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  padding: 6px 14px;
  background: #ede9fe;
  color: #7c3aed;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.review-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px 24px;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;
}

.nav-btn:hover:not(.disabled) {
  background: #e2e8f0;
  color: #1e4d7b;
}

.nav-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.action-btn.retry {
  background: #fef3c7;
  color: #d97706;
}

.action-btn.retry:hover {
  background: #fde68a;
  transform: translateY(-2px);
}

.action-btn.mastered {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: #fff;
}

.action-btn.mastered:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
}

.review-complete {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.complete-icon {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.complete-icon i {
  font-size: 48px;
  color: #fff;
}

.complete-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 32px;
}

.complete-stats {
  display: flex;
  gap: 60px;
  margin-bottom: 40px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 48px;
  font-weight: 700;
  color: #1e4d7b;
  display: block;
}

.stat-label {
  font-size: 16px;
  color: #64748b;
}

.complete-btn {
  padding: 16px 48px;
  background: linear-gradient(135deg, #1e4d7b 0%, #3d7ab5 100%);
  color: #fff;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.complete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(30, 77, 123, 0.3);
}

.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
}

.preview-full-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

@media (max-width: 768px) {
  .review-content {
    padding: 16px;
  }

  .review-footer {
    padding: 16px;
  }

  .action-btn {
    padding: 14px;
    font-size: 14px;
  }

  .gallery-image {
    max-width: 100%;
    max-height: 250px;
  }
}
</style>