<template>
  <div class="errorbook-page">
    <div class="header-bar">
      <div class="header-left">
        <h1 class="page-title">错题本</h1>
        <p class="page-desc">记录和复习各科错题</p>
      </div>
      <div class="header-stats">
        <div class="mini-stat">
          <span class="mini-stat-icon total-icon">📝</span>
          <span class="mini-stat-value">{{ stats.total }}</span>
        </div>
        <div class="mini-stat">
          <span class="mini-stat-icon pending-icon">⏳</span>
          <span class="mini-stat-value">{{ stats.pending }}</span>
        </div>
        <div class="mini-stat">
          <span class="mini-stat-icon mastered-icon">✅</span>
          <span class="mini-stat-value">{{ stats.mastered }}</span>
        </div>
        <div class="mini-stat">
          <span class="mini-stat-icon retry-icon">🔄</span>
          <span class="mini-stat-value">{{ stats.retry }}</span>
        </div>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">科目</label>
        <div class="select-wrapper">
          <select v-model="selectedSubject" class="filter-select">
            <option :value="null">全部</option>
            <option v-for="subject in subjectBooks" :key="subject.id" :value="subject.name">
              {{ subject.icon }} {{ subject.name }}
            </option>
          </select>
          <i class="layui-icon layui-icon-down filter-select-icon"></i>
        </div>
        <button class="add-subject-btn" @click="showAddSubjectModal = true" title="添加学科">
          <i class="layui-icon layui-icon-addition"></i>
        </button>
      </div>

      <div class="filter-group">
        <label class="filter-label">状态</label>
        <div class="select-wrapper">
          <select v-model="filterForm.status" class="filter-select">
            <option value="">全部</option>
            <option v-for="status in statusOptions" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
          <i class="layui-icon layui-icon-down filter-select-icon"></i>
        </div>
      </div>

      <div class="filter-group">
        <label class="filter-label">卡点类型</label>
        <div class="select-wrapper">
          <select v-model="filterForm.stickingType" class="filter-select">
            <option value="">全部</option>
            <option v-for="type in stickingTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
          <i class="layui-icon layui-icon-down filter-select-icon"></i>
        </div>
      </div>

      <div class="filter-group">
        <label class="filter-label">来源类型</label>
        <div class="select-wrapper">
          <select v-model="filterForm.sourceType" class="filter-select">
            <option value="">全部</option>
            <option v-for="source in allSourceTypes" :key="source" :value="source">
              {{ source }}
            </option>
          </select>
          <i class="layui-icon layui-icon-down filter-select-icon"></i>
        </div>
      </div>

      <div class="filter-group search-group">
        <input type="text" v-model="filterForm.searchSource" placeholder="搜索来源名称..." class="search-input" />
        <i class="layui-icon layui-icon-search search-icon"></i>
      </div>

      <div class="filter-group review-group">
        <button class="review-btn" @click="startReview('all')">
          <i class="layui-icon layui-icon-play"></i>
          复习全部
        </button>
        <button class="review-btn" @click="startReview('pending')" v-if="stats.pending > 0">
          <i class="layui-icon layui-icon-play"></i>
          待复习
        </button>
        <button class="review-btn" @click="startReview('retry')" v-if="stats.retry > 0">
          <i class="layui-icon layui-icon-play"></i>
          需重做
        </button>
      </div>

      <div class="filter-group action-group">
        <button class="add-btn filter-add-btn" @click="showAddModal = true">
          <i class="layui-icon layui-icon-add-circle"></i>
          添加错题
        </button>

        <button class="manage-btn" @click="showManageModal = true" title="管理类型">
          <i class="layui-icon layui-icon-set"></i>
        </button>
      </div>
    </div>

    <div class="main-content">
      <div class="list-panel">
        <div class="list-header">
          <span class="list-title">{{ selectedSubject || '全部' }}错题</span>
          <span class="list-count">共 {{ filteredItems.length }} 条</span>
        </div>

        <div v-if="filteredItems.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="layui-icon layui-icon-note"></i>
          </div>
          <div class="empty-text">暂无错题</div>
          <button class="empty-add-btn" @click="showAddModal = true">添加第一道错题</button>
        </div>

        <div v-else class="errorbook-list">
          <div v-for="item in filteredItems" :key="item.id" class="errorbook-card"
            @contextmenu.prevent="showErrorMenu($event, item)">
            <div class="card-header">
              <span class="subject-tag" :style="{ background: getSubjectColor(item.subject) }">
                {{ getSubjectIcon(item.subject) }} {{ item.subject }}
              </span>
              <span class="status-tag" :class="item.status">{{ getStatusLabel(item.status) }}</span>
            </div>

            <div class="card-body">
              <div class="source-info">
                <span v-for="(type, index) in (Array.isArray(item.sourceType) ? item.sourceType : [item.sourceType])"
                  :key="index" class="source-type">{{ type }}</span>
                <span v-if="item.chapter" class="chapter">{{ item.chapter }}</span>
                <span v-if="item.problemId" class="problem-id">{{ item.problemId }}</span>
              </div>

              <div v-if="item.sourceImages && item.sourceImages.length > 0" class="image-preview-row">
                <img v-for="(img, index) in item.sourceImages.slice(0, 3)" :key="index" :src="img" alt="来源图片"
                  class="preview-image" @click="previewImage(img)" />
                <span v-if="item.sourceImages.length > 3" class="image-more">+{{ item.sourceImages.length - 3 }}</span>
              </div>

              <div class="sticking-point">
                <span class="sticking-label">卡点：</span>
                <span class="sticking-type-tag">{{ item.stickingType }}</span>
                <span class="sticking-desc">{{ item.stickingPoint }}</span>
              </div>

              <div v-if="item.tags && item.tags.length > 0" class="tags-row">
                <span class="tags-label">标签：</span>
                <span v-for="tag in item.tags" :key="tag" class="tag-tag">
                  {{ tag }}
                  <button class="tag-remove" @click.stop="removeTagFromError(item.id, tag)">
                    <i class="layui-icon layui-icon-close"></i>
                  </button>
                </span>
                <button class="tag-add" @click.stop="showAddTagModal(item)">
                  <i class="layui-icon layui-icon-add"></i>
                </button>
              </div>

              <div class="card-meta">
                <span v-if="item.similarQuestions && item.similarQuestions.length > 0" class="similar-count">
                  <i class="layui-icon layui-icon-link"></i>
                  {{ item.similarQuestions.length }} 道同类型题
                </span>
                <span v-if="item.reviewCount > 0" class="review-count">
                  <i class="layui-icon layui-icon-refresh"></i>
                  已复习 {{ item.reviewCount }} 次
                </span>
                <span class="create-time">{{ item.createdAt }}</span>
              </div>
            </div>

            <div class="card-actions">
              <button class="action-btn review" @click="startReviewWithItem(item)">
                <i class="layui-icon layui-icon-play"></i>
                复习
              </button>
              <button class="action-btn edit" @click="editItem(item)">
                <i class="layui-icon layui-icon-edit"></i>
                编辑
              </button>
              <button class="action-btn delete" @click="deleteItem(item.id)">
                <i class="layui-icon layui-icon-delete"></i>
                删除
              </button>
            </div>

            <div class="status-toggle">
              <button v-for="status in statusOptions" :key="status.value" class="status-toggle-btn"
                :class="{ active: item.status === status.value }"
                :style="item.status === status.value ? { background: status.color } : {}"
                @click="updateStatus(item.id, status.value)">
                {{ status.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="contextMenu.show" class="context-menu" :style="contextMenu.style">
      <div v-for="(item, index) in contextMenu.items" :key="index" class="context-menu-item"
        @click="handleContextMenu(item.action)">
        <i :class="item.icon" class="menu-item-icon"></i>
        <span>{{ item.label }}</span>
      </div>
    </div>

    <div v-if="previewImageSrc" class="image-preview-modal" @click="previewImageSrc = null">
      <img :src="previewImageSrc" alt="预览" class="preview-full-image" />
    </div>

    <div v-if="showAddTagModal" class="modal-overlay" @click.self="showAddTagModal = false">
      <div class="modal-content small">
        <div class="modal-header">
          <span class="modal-title">添加标签</span>
          <button class="modal-close" @click="showAddTagModal = false">
            <i class="layui-icon layui-icon-close"></i>
          </button>
        </div>
        <div class="modal-body">
          <input type="text" v-model="newTagValue" placeholder="输入标签名称" class="form-input"
            @keyup.enter="confirmAddTag" />
          <div v-if="suggestedTags.length > 0" class="suggested-tags">
            <span class="suggest-label">常用标签：</span>
            <button v-for="tag in suggestedTags" :key="tag" class="suggest-tag" @click="addTagToError(tag)">
              {{ tag }}
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showAddTagModal = false">取消</button>
          <button class="btn-primary" @click="confirmAddTag">添加</button>
        </div>
      </div>
    </div>

    <div v-if="showSubjectManageModal" class="modal-overlay" @click.self="showSubjectManageModal = false">
      <div class="modal-content small">
        <div class="modal-header">
          <span class="modal-title">管理学科</span>
          <button class="modal-close" @click="showSubjectManageModal = false">
            <i class="layui-icon layui-icon-close"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="subjectBooks.length === 0" class="empty-state">
            暂无学科，点击下方按钮添加
          </div>
          <div v-else class="subject-list">
            <div v-for="subject in subjectBooks" :key="subject.id" class="subject-item">
              <div class="subject-info">
                <span class="subject-icon">{{ subject.icon }}</span>
                <span class="subject-name">{{ subject.name }}</span>
              </div>
              <div class="subject-actions">
                <button class="action-btn edit" @click="editSubject(subject)">
                  <i class="layui-icon layui-icon-edit"></i>
                </button>
                <button class="action-btn delete" @click="deleteSubject(subject)">
                  <i class="layui-icon layui-icon-delete"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-primary" @click="showAddSubjectModal = true; showSubjectManageModal = false">
            <i class="layui-icon layui-icon-add"></i>
            添加学科
          </button>
        </div>
      </div>
    </div>

    <div v-if="showAddSubjectModal" class="modal-overlay" @click.self="showAddSubjectModal = false">
      <div class="modal-content small">
        <div class="modal-header">
          <span class="modal-title">{{ editingSubject ? '编辑学科' : '添加学科' }}</span>
          <button class="modal-close" @click="showAddSubjectModal = false">
            <i class="layui-icon layui-icon-close"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>学科名称</label>
            <input type="text" v-model="newSubjectName" placeholder="如：历史" class="form-input" />
          </div>
          <div class="form-group">
            <label>选择图标</label>
            <div class="icon-selector">
              <button v-for="icon in iconOptions" :key="icon" class="icon-option"
                :class="{ active: newSubjectIcon === icon }" @click="newSubjectIcon = icon">
                {{ icon }}
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showAddSubjectModal = false">取消</button>
          <button class="btn-primary" @click="confirmAddSubject">
            {{ editingSubject ? '保存' : '添加' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showManageModal" class="modal-overlay" @click.self="showManageModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">错题本管理</span>
          <button class="modal-close" @click="showManageModal = false">
            <i class="layui-icon layui-icon-close"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="manage-tabs">
            <button v-for="tab in manageTabs" :key="tab.key" class="manage-tab"
              :class="{ active: activeManageTab === tab.key }" @click="activeManageTab = tab.key">
              {{ tab.label }}
            </button>
          </div>

          <div v-show="activeManageTab === 'source'" class="manage-section">
            <div class="section-header">
              <span class="section-title">来源类型</span>
              <button class="add-type-btn" @click="showAddSourceTypeInput = !showAddSourceTypeInput">
                <i class="layui-icon layui-icon-add"></i>
                添加
              </button>
            </div>
            <div v-if="showAddSourceTypeInput" class="add-type-row">
              <input type="text" v-model="newSourceTypeName" placeholder="输入来源类型名称" class="form-input"
                @keyup.enter="addSourceTypeConfig" />
              <button class="btn-primary small" @click="addSourceTypeConfig">确认</button>
            </div>
            <div v-if="allSourceTypes.length === 0" class="empty-state">暂无来源类型</div>
            <div v-else class="type-list">
              <div v-for="type in allSourceTypes" :key="type" class="type-item">
                <span class="type-name">{{ type }}</span>
                <div class="type-actions">
                  <button class="action-btn edit" @click="editSourceType(type)">
                    <i class="layui-icon layui-icon-edit"></i>
                  </button>
                  <button class="action-btn delete" @click="deleteSourceType(type)">
                    <i class="layui-icon layui-icon-delete"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-show="activeManageTab === 'sticking'" class="manage-section">
            <div class="section-header">
              <span class="section-title">卡点类型</span>
              <button class="add-type-btn" @click="showAddStickingTypeInput = !showAddStickingTypeInput">
                <i class="layui-icon layui-icon-add"></i>
                添加
              </button>
            </div>
            <div v-if="showAddStickingTypeInput" class="add-type-row">
              <input type="text" v-model="newStickingTypeName" placeholder="输入卡点类型名称" class="form-input"
                @keyup.enter="addStickingTypeConfig" />
              <button class="btn-primary small" @click="addStickingTypeConfig">确认</button>
            </div>
            <div v-if="stickingTypes.length === 0" class="empty-state">暂无卡点类型</div>
            <div v-else class="type-list">
              <div v-for="type in stickingTypes" :key="type" class="type-item">
                <span class="type-name">{{ type }}</span>
                <div class="type-actions">
                  <button class="action-btn edit" @click="editStickingType(type)">
                    <i class="layui-icon layui-icon-edit"></i>
                  </button>
                  <button class="action-btn delete" @click="deleteStickingType(type)">
                    <i class="layui-icon layui-icon-delete"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-show="activeManageTab === 'subject'" class="manage-section">
            <div class="section-header">
              <span class="section-title">学科</span>
              <button class="add-type-btn" @click="showAddSubjectModal = true; showManageModal = false">
                <i class="layui-icon layui-icon-add"></i>
                添加
              </button>
            </div>
            <div v-if="subjectBooks.length === 0" class="empty-state">暂无学科</div>
            <div v-else class="type-list">
              <div v-for="subject in subjectBooks" :key="subject.id" class="type-item">
                <div class="subject-info">
                  <span class="subject-icon">{{ subject.icon }}</span>
                  <span class="type-name">{{ subject.name }}</span>
                </div>
                <div class="type-actions">
                  <button class="action-btn edit" @click="editSubject(subject); showManageModal = false">
                    <i class="layui-icon layui-icon-edit"></i>
                  </button>
                  <button class="action-btn delete" @click="deleteSubject(subject)">
                    <i class="layui-icon layui-icon-delete"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showManageModal = false">关闭</button>
        </div>
      </div>
    </div>

    <div v-if="showEditTypeModal" class="modal-overlay" @click.self="showEditTypeModal = false">
      <div class="modal-content small">
        <div class="modal-header">
          <span class="modal-title">编辑类型</span>
          <button class="modal-close" @click="showEditTypeModal = false">
            <i class="layui-icon layui-icon-close"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>原类型名称</label>
            <input type="text" :value="editingTypeOldName" disabled class="form-input" />
          </div>
          <div class="form-group">
            <label>新类型名称</label>
            <input type="text" v-model="editingTypeNewName" placeholder="输入新的类型名称" class="form-input" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showEditTypeModal = false">取消</button>
          <button class="btn-primary" @click="confirmEditType">保存</button>
        </div>
      </div>
    </div>

    <ErrorForm v-if="showAddModal || editingItem" :item="editingItem" @close="closeModal" @saved="handleSaved" />

    <ReviewMode v-if="showReviewMode" :items="reviewItems" @close="showReviewMode = false" @updated="handleSaved" />
  </div>
</template>

<script setup>import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { layer } from '@layui/layui-vue';
import { dataManager } from '@/utils/dataManager';
import ErrorForm from './ErrorForm.vue';
import ReviewMode from './ReviewMode.vue';
const showAddModal = ref(false);
const editingItem = ref(null);
const showReviewMode = ref(false);
const reviewItems = ref([]);
const selectedSubject = ref(null);
const subjectBooks = ref([]);
const stats = ref({
  total: 0,
  pending: 0,
  mastered: 0,
  retry: 0,
  subjectStats: {},
  stickingTypeStats: {}
});
const filterForm = reactive({
  status: '',
  stickingType: '',
  sourceType: '',
  searchSource: ''
});
const contextMenu = ref({
  show: false,
  items: [],
  style: {},
  actionData: null
});
const previewImageSrc = ref(null);
const showAddTagModal = ref(false);
const currentTagItem = ref(null);
const newTagValue = ref('');
const showAddSubjectModal = ref(false);
const showSubjectManageModal = ref(false);
const editingSubject = ref(null);
const newSubjectName = ref('');
const newSubjectIcon = ref('📖');
const iconOptions = ['📐', '📚', '⚛️', '🧪', '📖', '📜', '🌍', '🧬', '🎨', '🎵'];
const showManageModal = ref(false);
const activeManageTab = ref('source');
const manageTabs = [
  { key: 'source', label: '来源类型' },
  { key: 'sticking', label: '卡点类型' },
  { key: 'subject', label: '学科' }
];
const showAddSourceTypeInput = ref(false);
const newSourceTypeName = ref('');
const showAddStickingTypeInput = ref(false);
const newStickingTypeName = ref('');
const showEditTypeModal = ref(false);
const editingTypeOldName = ref('');
const editingTypeNewName = ref('');
const editingTypeCategory = ref('');
const stickingTypes = computed(() => {
  return dataManager.errorbookConfig.getStickingTypes();
});
const allSourceTypes = computed(() => {
  return dataManager.errorbookConfig.getSourceTypes();
});
const statusOptions = [
  { value: 'pending', label: '待复习', color: '#3b82f6' },
  { value: 'mastered', label: '已掌握', color: '#10b981' },
  { value: 'retry', label: '需重做', color: '#f59e0b' }
];
const filteredItems = computed(() => {
  const params = { ...filterForm };
  if (selectedSubject.value) {
    params.subject = selectedSubject.value;
  }
  return dataManager.errorbook.filter(params);
});
const getStatusLabel = (status) => {
  const option = statusOptions.find(o => o.value === status);
  return option ? option.label : status;
};
const getSubjectColor = (subjectName) => {
  const subject = subjectBooks.value.find(s => s.name === subjectName);
  return subject ? subject.color : '#1e4d7b';
};
const getSubjectIcon = (subjectName) => {
  const subject = subjectBooks.value.find(s => s.name === subjectName);
  return subject ? subject.icon : '📖';
};
const loadData = () => {
  subjectBooks.value = dataManager.subjectBooks.getAll();
  stats.value = dataManager.errorbook.getStats();
  dataManager.subjectBooks.refreshAllCounts();
};
const selectSubject = (subject) => {
  selectedSubject.value = subject;
};
const closeModal = () => {
  showAddModal.value = false;
  editingItem.value = null;
};
const editItem = (item) => {
  editingItem.value = { ...item };
};
const deleteItem = (id) => {
  if (confirm('确定删除这道错题吗？')) {
    const success = dataManager.errorbook.delete(id);
    if (success) {
      layer.msg('删除成功', { icon: 1 });
      loadData();
    }
    else {
      layer.msg('删除失败', { icon: 5 });
    }
  }
};
const updateStatus = (id, status) => {
  const success = dataManager.errorbook.updateStatus(id, status);
  if (success) {
    loadData();
  }
};
const handleSaved = () => {
  loadData();
  closeModal();
};
const startReview = (type) => {
  let reviewList = filteredItems.value;
  if (type === 'pending') {
    reviewList = reviewList.filter(i => i.status === 'pending');
  }
  else if (type === 'retry') {
    reviewList = reviewList.filter(i => i.status === 'retry');
  }
  if (reviewList.length === 0) {
    layer.msg('没有可复习的错题', { icon: 5 });
    return;
  }
  reviewItems.value = reviewList;
  showReviewMode.value = true;
};
const startReviewWithItem = (item) => {
  reviewItems.value = [item];
  showReviewMode.value = true;
};
const showSubjectMenu = (event, subject) => {
  contextMenu.value.actionData = subject;
  if (subject) {
    contextMenu.value.items = [
      { label: '编辑学科', icon: 'layui-icon layui-icon-edit', action: 'editSubject' },
      { label: '删除学科', icon: 'layui-icon layui-icon-delete', action: 'deleteSubject' },
      { label: '复习该学科错题', icon: 'layui-icon layui-icon-play', action: 'reviewSubject' }
    ];
  }
  else {
    contextMenu.value.items = [
      { label: '添加新学科', icon: 'layui-icon layui-icon-add', action: 'addSubject' }
    ];
  }
  contextMenu.value.style = {
    left: event.clientX + 'px',
    top: event.clientY + 'px'
  };
  contextMenu.value.show = true;
};
const showErrorMenu = (event, item) => {
  contextMenu.value.actionData = item;
  contextMenu.value.items = [
    { label: '编辑错题', icon: 'layui-icon layui-icon-edit', action: 'editError' },
    { label: '删除错题', icon: 'layui-icon layui-icon-delete', action: 'deleteError' },
    { label: '添加标签', icon: 'layui-icon layui-icon-tag', action: 'addTag' },
    { label: '标记为已掌握', icon: 'layui-icon layui-icon-check-circle', action: 'markMastered' },
    { label: '标记为需重做', icon: 'layui-icon layui-icon-refresh', action: 'markRetry' },
    { label: '开始复习', icon: 'layui-icon layui-icon-play', action: 'reviewError' }
  ];
  contextMenu.value.style = {
    left: event.clientX + 'px',
    top: event.clientY + 'px'
  };
  contextMenu.value.show = true;
};
const handleContextMenu = (action) => {
  contextMenu.value.show = false;
  const data = contextMenu.value.actionData;
  switch (action) {
    case 'addSubject':
      showAddSubjectModal.value = true;
      break;
    case 'editSubject':
      newSubjectName.value = data.name;
      newSubjectIcon.value = data.icon;
      showAddSubjectModal.value = true;
      break;
    case 'deleteSubject':
      if (confirm(`确定删除"${data.name}"学科吗？该学科下的错题不会被删除。`)) {
        dataManager.subjectBooks.delete(data.id);
        loadData();
        layer.msg('删除成功', { icon: 1 });
      }
      break;
    case 'reviewSubject':
      selectedSubject.value = data.name;
      startReview('all');
      break;
    case 'editError':
      editItem(data);
      break;
    case 'deleteError':
      deleteItem(data.id);
      break;
    case 'addTag':
      showAddTagModalItem(data);
      break;
    case 'markMastered':
      updateStatus(data.id, 'mastered');
      break;
    case 'markRetry':
      updateStatus(data.id, 'retry');
      break;
    case 'reviewError':
      startReviewWithItem(data);
      break;
  }
};
const showAddTagModalItem = (item) => {
  currentTagItem.value = item;
  newTagValue.value = '';
  showAddTagModal.value = true;
};
const addTagToError = (tag) => {
  if (currentTagItem.value) {
    dataManager.errorbook.addTag(currentTagItem.value.id, tag);
    layer.msg('标签添加成功', { icon: 1 });
    loadData();
  }
  showAddTagModal.value = false;
};
const confirmAddTag = () => {
  if (newTagValue.value.trim()) {
    addTagToError(newTagValue.value.trim());
  }
};
const removeTagFromError = (id, tag) => {
  dataManager.errorbook.removeTag(id, tag);
  loadData();
};
const editSubject = (subject) => {
  editingSubject.value = subject;
  newSubjectName.value = subject.name;
  newSubjectIcon.value = subject.icon;
  showSubjectManageModal.value = false;
  showAddSubjectModal.value = true;
};
const addSourceTypeConfig = () => {
  const name = newSourceTypeName.value.trim();
  if (!name) {
    layer.msg('请输入类型名称', { icon: 5 });
    return;
  }
  dataManager.errorbookConfig.addSourceType(name);
  layer.msg('添加成功', { icon: 1 });
  newSourceTypeName.value = '';
  showAddSourceTypeInput.value = false;
};
const deleteSourceType = (type) => {
  layer.confirm(`确定要删除来源类型「${type}」吗？已使用此类型的错题将保留原数据。`, {
    icon: 3,
    title: '确认删除'
  }, (index) => {
    layer.close(index);
    dataManager.errorbookConfig.removeSourceType(type);
    layer.msg('删除成功', { icon: 1 });
  });
};
const editSourceType = (type) => {
  editingTypeOldName.value = type;
  editingTypeNewName.value = type;
  editingTypeCategory.value = 'source';
  showEditTypeModal.value = true;
};
const addStickingTypeConfig = () => {
  const name = newStickingTypeName.value.trim();
  if (!name) {
    layer.msg('请输入类型名称', { icon: 5 });
    return;
  }
  dataManager.errorbookConfig.addStickingType(name);
  layer.msg('添加成功', { icon: 1 });
  newStickingTypeName.value = '';
  showAddStickingTypeInput.value = false;
};
const deleteStickingType = (type) => {
  layer.confirm(`确定要删除卡点类型「${type}」吗？已使用此类型的错题将保留原数据。`, {
    icon: 3,
    title: '确认删除'
  }, (index) => {
    layer.close(index);
    dataManager.errorbookConfig.removeStickingType(type);
    layer.msg('删除成功', { icon: 1 });
  });
};
const editStickingType = (type) => {
  editingTypeOldName.value = type;
  editingTypeNewName.value = type;
  editingTypeCategory.value = 'sticking';
  showEditTypeModal.value = true;
};
const confirmEditType = () => {
  const newName = editingTypeNewName.value.trim();
  if (!newName) {
    layer.msg('请输入新类型名称', { icon: 5 });
    return;
  }
  if (editingTypeCategory.value === 'source') {
    dataManager.errorbookConfig.updateSourceType(editingTypeOldName.value, newName);
  } else if (editingTypeCategory.value === 'sticking') {
    dataManager.errorbookConfig.updateStickingType(editingTypeOldName.value, newName);
  }
  layer.msg('修改成功', { icon: 1 });
  showEditTypeModal.value = false;
};
const deleteSubject = (subject) => {
  layer.confirm(`确定要删除学科「${subject.name}」吗？删除后相关错题将不受影响。`, {
    icon: 3,
    title: '确认删除'
  }, (index) => {
    layer.close(index);
    dataManager.subjectBooks.delete(subject.id);
    layer.msg('删除成功', { icon: 1 });
    loadData();
  });
};
const confirmAddSubject = () => {
  if (!newSubjectName.value.trim()) {
    layer.msg('请输入学科名称', { icon: 5 });
    return;
  }
  if (editingSubject.value) {
    dataManager.subjectBooks.update({
      id: editingSubject.value.id,
      name: newSubjectName.value,
      icon: newSubjectIcon.value
    });
    layer.msg('修改成功', { icon: 1 });
    editingSubject.value = null;
  }
  else {
    dataManager.subjectBooks.add({
      name: newSubjectName.value,
      icon: newSubjectIcon.value,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    });
    layer.msg('添加成功', { icon: 1 });
  }
  showAddSubjectModal.value = false;
  loadData();
};
const previewImage = (src) => {
  previewImageSrc.value = src;
};
const handleClickOutside = (event) => {
  if (!event.target.closest('.context-menu')) {
    contextMenu.value.show = false;
  }
};
onMounted(() => {
  loadData();
  document.addEventListener('click', handleClickOutside);
});
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.errorbook-page {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
}

.header-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-left {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.page-desc {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.header-stats {
  display: flex;
  gap: 16px;
}

.mini-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.mini-stat-icon {
  font-size: 18px;
}

.mini-stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #1e4d7b 0%, #3d7ab5 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(30, 77, 123, 0.3);
}

.manage-btn {
  width: 40px;
  height: 40px;
  background: #fef3c7;
  border: none;
  border-radius: 10px;
  color: #d97706;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.manage-btn:hover {
  background: #fde68a;
  transform: scale(1.05);
}

.manage-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.manage-tab {
  padding: 8px 20px;
  background: #f8fafc;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.manage-tab.active {
  background: #dbeafe;
  color: #2563eb;
}

.manage-tab:hover {
  background: #f1f5f9;
}

.manage-section {
  padding-top: 10px;
}

.add-type-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #dbeafe;
  color: #2563eb;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-type-btn:hover {
  background: #bfdbfe;
}

.add-type-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.add-type-row .form-input {
  flex: 1;
  max-width: 300px;
}

.btn-primary.small {
  padding: 8px 16px;
  font-size: 13px;
}

.type-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.type-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 10px;
}

.type-name {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.type-actions {
  display: flex;
  gap: 8px;
}

.filter-bar {
  position: sticky;
  top: 70px;
  z-index: 99;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  white-space: nowrap;
}

.select-wrapper {
  position: relative;
}

.filter-select {
  padding: 8px 32px 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  color: #334155;
  background: #fff;
  cursor: pointer;
  outline: none;
  min-width: 120px;
  appearance: none;
}

.filter-select:hover {
  border-color: #cbd5e1;
}

.filter-select:focus {
  border-color: #1e4d7b;
}

.filter-select-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #94a3b8;
  pointer-events: none;
}

.search-group {
  flex: 1;
  min-width: 200px;
  max-width: 300px;
  position: relative;
}

.search-group .search-input {
  width: 100%;
  padding: 8px 36px 8px 12px;
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #94a3b8;
}

.review-group {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.review-group .review-btn {
  margin-bottom: 0;
  padding: 8px 16px;
  font-size: 12px;
}

.add-subject-btn {
  width: 32px;
  height: 32px;
  background: #dbeafe;
  border: none;
  border-radius: 8px;
  color: #2563eb;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.add-subject-btn:hover {
  background: #bfdbfe;
  transform: scale(1.05);
}

.edit-subject-btn {
  width: 32px;
  height: 32px;
  background: #fef3c7;
  border: none;
  border-radius: 8px;
  color: #d97706;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.edit-subject-btn:hover {
  background: #fde68a;
  transform: scale(1.05);
}

.filter-add-btn {
  margin-left: auto;
  padding: 8px 20px;
  font-size: 14px;
}

.subject-list {
  max-height: 300px;
  overflow-y: auto;
}

.subject-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
  margin-bottom: 8px;
}

.subject-item:last-child {
  margin-bottom: 0;
}

.subject-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.subject-info .subject-icon {
  font-size: 20px;
}

.subject-info .subject-name {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.subject-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn.edit {
  background: #dbeafe;
  color: #2563eb;
}

.action-btn.edit:hover {
  background: #bfdbfe;
}

.action-btn.delete {
  background: #fee2e2;
  color: #ef4444;
}

.action-btn.delete:hover {
  background: #fecaca;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 24px;
  padding-top: 0;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13px;
  outline: none;
}

.search-input:focus {
  border-color: #1e4d7b;
}

.review-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #1e4d7b 0%, #3d7ab5 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.review-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(30, 77, 123, 0.3);
}

.list-panel {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.list-title {
  font-size: 17px;
  font-weight: 600;
  color: #1e293b;
}

.list-count {
  font-size: 13px;
  color: #64748b;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.empty-icon i {
  font-size: 36px;
  color: #94a3b8;
}

.empty-text {
  font-size: 16px;
  color: #94a3b8;
  margin-bottom: 20px;
}

.empty-add-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #1e4d7b 0%, #3d7ab5 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

.errorbook-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.errorbook-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.2s ease;
}

.errorbook-card:hover {
  background: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.subject-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  color: #fff;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag.pending {
  background: #dbeafe;
  color: #2563eb;
}

.status-tag.mastered {
  background: #dcfce7;
  color: #16a34a;
}

.status-tag.retry {
  background: #fef3c7;
  color: #d97706;
}

.card-body {
  margin-bottom: 16px;
}

.source-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.source-type {
  padding: 2px 8px;
  background: #e2e8f0;
  border-radius: 4px;
  font-size: 12px;
  color: #64748b;
}

.source-name {
  font-size: 14px;
  color: #475569;
  font-weight: 500;
}

.chapter,
.page,
.problem-id {
  font-size: 13px;
  color: #94a3b8;
}

.image-preview-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.preview-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid #e2e8f0;
}

.preview-image:hover {
  border-color: #1e4d7b;
}

.image-more {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 8px;
  font-size: 14px;
  color: #64748b;
}

.sticking-point {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.sticking-label {
  font-size: 13px;
  color: #64748b;
}

.sticking-type-tag {
  padding: 2px 8px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 4px;
  font-size: 12px;
}

.sticking-desc {
  font-size: 13px;
  color: #475569;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.tags-label {
  font-size: 13px;
  color: #64748b;
}

.tag-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #ede9fe;
  color: #7c3aed;
  border-radius: 16px;
  font-size: 12px;
}

.tag-remove {
  background: none;
  border: none;
  color: #7c3aed;
  font-size: 12px;
  cursor: pointer;
}

.tag-add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 12px;
  color: #94a3b8;
}

.similar-count,
.review-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.review {
  background: #dbeafe;
  color: #2563eb;
}

.action-btn.review:hover {
  background: #bfdbfe;
}

.action-btn.edit {
  background: #dcfce7;
  color: #16a34a;
}

.action-btn.edit:hover {
  background: #bbf7d0;
}

.action-btn.delete {
  background: #fee2e2;
  color: #dc2626;
}

.action-btn.delete:hover {
  background: #fecaca;
}

.status-toggle {
  display: flex;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px dashed #e2e8f0;
}

.status-toggle-btn {
  flex: 1;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-toggle-btn:hover {
  border-color: #cbd5e1;
}

.status-toggle-btn.active {
  border-color: transparent;
  color: #fff;
}

.context-menu {
  position: fixed;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  min-width: 160px;
  padding: 6px;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #475569;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.context-menu-item:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.menu-item-icon {
  font-size: 16px;
  width: 20px;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #fff;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modal-content.small {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.modal-close {
  background: none;
  border: none;
  font-size: 18px;
  color: #94a3b8;
  cursor: pointer;
}

.modal-body {
  padding: 20px 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #334155;
  outline: none;
}

.form-input:focus {
  border-color: #1e4d7b;
}

.icon-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.icon-option {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border: 2px solid transparent;
  border-radius: 10px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-option:hover {
  background: #e2e8f0;
}

.icon-option.active {
  border-color: #1e4d7b;
  background: #dbeafe;
}

.suggested-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.suggest-label {
  font-size: 13px;
  color: #64748b;
}

.suggest-tag {
  padding: 4px 10px;
  background: #f1f5f9;
  border: none;
  border-radius: 16px;
  font-size: 12px;
  color: #475569;
  cursor: pointer;
}

.suggest-tag:hover {
  background: #dbeafe;
  color: #2563eb;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
}

.btn-secondary {
  padding: 10px 20px;
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
}

.btn-primary {
  padding: 10px 20px;
  background: linear-gradient(135deg, #1e4d7b 0%, #3d7ab5 100%);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
}

@media (max-width: 768px) {
  .filter-bar {
    position: sticky;
    top: 90px;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px 16px;
    margin: 0 16px;
  }

  .filter-group {
    width: 100%;
  }

  .filter-group:not(.search-group):not(.review-group):not(.action-group) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #f1f5f9;
  }

  .filter-group:not(.search-group):not(.review-group):not(.action-group) .filter-label {
    flex-shrink: 0;
    width: 60px;
    font-size: 13px;
  }

  .filter-group:not(.search-group):not(.review-group):not(.action-group) .select-wrapper {
    flex: 1;
    max-width: calc(100% - 80px);
  }

  .filter-group:not(.search-group):not(.review-group):not(.action-group) .add-subject-btn {
    margin-left: 8px;
  }

  .select-wrapper {
    width: 100%;
  }

  .filter-select {
    width: 100%;
    padding: 10px 32px 10px 12px;
    font-size: 14px;
  }

  .search-group {
    max-width: 100%;
    order: -1;
  }

  .search-group .search-input {
    padding: 12px 36px 12px 12px;
    font-size: 14px;
  }

  .review-group {
    margin-left: 0;
    justify-content: center;
    gap: 10px;
    padding: 8px 0;
  }

  .review-group .review-btn {
    padding: 10px 16px;
    font-size: 13px;
  }

  .filter-add-btn {
    margin-left: 0;
    padding: 12px 20px;
    font-size: 14px;
    width: 100%;
    justify-content: center;
  }

  .manage-btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
    border-radius: 10px;
  }

  .action-group {
    display: flex;
    gap: 10px;
    order: 10;
  }

  .header-bar {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
    align-items: flex-start;
  }

  .header-stats {
    width: 100%;
    justify-content: space-between;
  }

  .page-title {
    font-size: 22px;
  }

  .page-desc {
    font-size: 13px;
  }

  .card-actions {
    flex-wrap: wrap;
    gap: 8px;
  }

  .action-btn {
    flex: 1;
    min-width: calc(50% - 4px);
    justify-content: center;
    padding: 10px 8px;
    font-size: 13px;
  }

  .tags-row {
    flex-wrap: wrap;
    gap: 6px;
  }

  .main-content {
    gap: 12px;
    padding: 12px 16px;
    padding-top: 0;
  }

  .errorbook-card {
    padding: 16px;
  }

  .card-header {
    margin-bottom: 12px;
  }

  .subject-tag {
    padding: 4px 10px;
    font-size: 12px;
  }

  .status-badge {
    padding: 3px 8px;
    font-size: 11px;
  }

  .source-info {
    font-size: 13px;
  }

  .sticking-tags {
    gap: 4px;
    margin-bottom: 12px;
  }

  .sticking-tag {
    padding: 3px 8px;
    font-size: 11px;
  }

  .card-footer {
    padding-top: 12px;
    font-size: 12px;
  }
}
</style>