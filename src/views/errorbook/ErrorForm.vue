<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <span class="modal-title">{{ item ? '编辑错题' : '添加错题' }}</span>
        <button class="modal-close" @click="$emit('close')">
          <i class="layui-icon layui-icon-close"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="form-section">
          <div class="section-header">
            <div class="section-icon">📝</div>
            <h3 class="section-title">来源信息</h3>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>所属学科</label>
              <select v-model="formData.subject" class="form-select">
                <option v-for="subject in subjectBooks" :key="subject.id" :value="subject.name">
                  {{ subject.icon }} {{ subject.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>来源类型</label>
            <div class="tag-selector">
              <span v-for="type in selectedSourceTypes" :key="type" class="tag-selected">
                {{ type }}
                <button class="tag-remove" @click="removeSourceType(type)">
                  <i class="layui-icon layui-icon-close"></i>
                </button>
              </span>
              <div class="tag-input-wrapper">
                <input type="text" v-model="newSourceType" placeholder="添加来源类型" class="form-input tag-input"
                  @keyup.enter="addSourceType" />
                <button class="tag-add-btn" @click="addSourceType">
                  <i class="layui-icon layui-icon-add"></i>
                </button>
              </div>
            </div>
            <div v-if="sourceTypeOptions.length > 0" class="source-type-options">
              <button v-for="type in sourceTypeOptions" :key="type" class="type-option" @click="addSourceType(type)">
                {{ type }}
              </button>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>章节</label>
              <input type="text" v-model="formData.chapter" placeholder="如：第三章" class="form-input" />
            </div>
            <div class="form-group">
              <label>页码/题号</label>
              <input type="text" v-model="formData.problemId" placeholder="如：P128 / T3-2" class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label>来源图片</label>
            <div class="image-upload-area">
              <div v-if="formData.sourceImages && formData.sourceImages.length > 0" class="image-preview-list">
                <div v-for="(img, index) in formData.sourceImages" :key="index" class="image-preview-item">
                  <img :src="img" alt="来源图片" />
                  <button class="remove-image-btn" @click="removeImage('sourceImages', index)">
                    <i class="layui-icon layui-icon-close"></i>
                  </button>
                </div>
              </div>
              <label class="upload-btn">
                <input type="file" accept="image/*" multiple @change="handleImageUpload('sourceImages', $event)" />
                <i class="layui-icon layui-icon-upload"></i>
                <span>上传图片</span>
              </label>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <div class="section-icon">🎯</div>
            <h3 class="section-title">卡点分析</h3>
          </div>
          <div class="form-group">
            <label>卡点类型</label>
            <select v-model="formData.stickingType" class="form-select">
              <option value="概念不清">概念不清</option>
              <option value="方法不当">方法不当</option>
              <option value="计算错误">计算错误</option>
              <option value="审题偏差">审题偏差</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div class="form-group">
            <label>卡点描述</label>
            <textarea v-model="formData.stickingPoint" placeholder="简要描述遇到的卡点" class="form-textarea"></textarea>
          </div>
          <div class="form-group">
            <label>深度分析</label>
            <textarea v-model="formData.stickingAnalysis" placeholder="详细分析错误原因和正确思路"
              class="form-textarea large"></textarea>
          </div>
          <div class="form-group">
            <label>卡点图片</label>
            <div class="image-upload-area">
              <div v-if="formData.stickingImages && formData.stickingImages.length > 0" class="image-preview-list">
                <div v-for="(img, index) in formData.stickingImages" :key="index" class="image-preview-item">
                  <img :src="img" alt="卡点图片" />
                  <button class="remove-image-btn" @click="removeImage('stickingImages', index)">
                    <i class="layui-icon layui-icon-close"></i>
                  </button>
                </div>
              </div>
              <label class="upload-btn">
                <input type="file" accept="image/*" multiple @change="handleImageUpload('stickingImages', $event)" />
                <i class="layui-icon layui-icon-upload"></i>
                <span>上传图片</span>
              </label>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <div class="section-icon">🔗</div>
            <h3 class="section-title">同类型题</h3>
            <button class="add-similar-btn" @click="addSimilarQuestion">
              <i class="layui-icon layui-icon-add"></i>
              添加同类型题
            </button>
          </div>
          <div v-if="formData.similarQuestions.length === 0" class="empty-similar">
            暂无同类型题，点击上方按钮添加
          </div>
          <div v-else class="similar-list">
            <div v-for="(similar, index) in formData.similarQuestions" :key="index" class="similar-item">
              <div class="similar-header">
                <span class="similar-index">同类型题 {{ index + 1 }}</span>
                <button class="remove-similar-btn" @click="removeSimilarQuestion(index)">
                  <i class="layui-icon layui-icon-close"></i>
                </button>
              </div>
              <div class="form-group">
                <label>题目描述</label>
                <textarea v-model="similar.description" placeholder="同类型题描述" class="form-textarea"></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>来源</label>
                  <input type="text" v-model="similar.source" placeholder="来源" class="form-input" />
                </div>
                <div class="form-group">
                  <label>关联关系</label>
                  <select v-model="similar.relation" class="form-select">
                    <option value="同考点">同考点</option>
                    <option value="同题型">同题型</option>
                    <option value="同方法">同方法</option>
                    <option value="变式">变式</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>同类型题图片</label>
                <div class="image-upload-area">
                  <div v-if="similar.images && similar.images.length > 0" class="image-preview-list">
                    <div v-for="(img, imgIndex) in similar.images" :key="imgIndex" class="image-preview-item">
                      <img :src="img" alt="同类型题图片" />
                      <button class="remove-image-btn" @click="removeSimilarImage(index, imgIndex)">
                        <i class="layui-icon layui-icon-close"></i>
                      </button>
                    </div>
                  </div>
                  <label class="upload-btn small">
                    <input type="file" accept="image/*" multiple @change="handleSimilarImageUpload(index, $event)" />
                    <i class="layui-icon layui-icon-upload"></i>
                    <span>上传图片</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="$emit('close')">取消</button>
        <button class="btn-primary" @click="save">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>import { reactive, ref, watch, onMounted, computed } from 'vue';
import { layer } from '@layui/layui-vue';
import { dataManager } from '@/utils/dataManager';
const props = defineProps({
  item: {
    type: Object,
    default: null
  }
});
const emit = defineEmits(['close', 'saved']);
const subjectBooks = ref([]);
const newSourceType = ref('');
const sourceTypeDefaults = ['书本', '试卷', '作业', '课堂笔记', '练习册', '其他'];
const selectedSourceTypes = ref([]);
const formData = reactive({
  subject: '数学',
  chapter: '',
  problemId: '',
  stickingType: '方法不当',
  stickingPoint: '',
  stickingAnalysis: '',
  sourceImages: [],
  stickingImages: [],
  similarQuestions: []
});
const sourceTypeOptions = computed(() => {
  return sourceTypeDefaults.filter(t => !selectedSourceTypes.value.includes(t));
});
const loadSubjectBooks = () => {
  subjectBooks.value = dataManager.subjectBooks.getAll();
};
watch(() => props.item, (newItem) => {
  if (newItem) {
    Object.assign(formData, {
      ...newItem,
      sourceImages: newItem.sourceImages || [],
      stickingImages: newItem.stickingImages || [],
      similarQuestions: newItem.similarQuestions ? [...newItem.similarQuestions.map(s => ({
        ...s,
        images: s.images || []
      }))] : []
    });
    selectedSourceTypes.value = newItem.sourceType ? (Array.isArray(newItem.sourceType) ? [...newItem.sourceType] : [newItem.sourceType]) : [];
  }
}, { immediate: true });
onMounted(() => {
  loadSubjectBooks();
});
const addSourceType = (type = null) => {
  const value = type || newSourceType.value.trim();
  if (!value)
    return;
  if (!selectedSourceTypes.value.includes(value)) {
    selectedSourceTypes.value.push(value);
  }
  newSourceType.value = '';
};
const removeSourceType = (type) => {
  const index = selectedSourceTypes.value.indexOf(type);
  if (index !== -1) {
    selectedSourceTypes.value.splice(index, 1);
  }
};
const handleImageUpload = (field, event) => {
  const files = event.target.files;
  if (files) {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        formData[field].push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }
};
const removeImage = (field, index) => {
  formData[field].splice(index, 1);
};
const handleSimilarImageUpload = (similarIndex, event) => {
  const files = event.target.files;
  if (files) {
    const similar = formData.similarQuestions[similarIndex];
    if (!similar.images)
      similar.images = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        similar.images.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }
};
const removeSimilarImage = (similarIndex, imgIndex) => {
  formData.similarQuestions[similarIndex].images.splice(imgIndex, 1);
};
const addSimilarQuestion = () => {
  formData.similarQuestions.push({
    description: '',
    source: '',
    relation: '同考点',
    images: []
  });
};
const removeSimilarQuestion = (index) => {
  formData.similarQuestions.splice(index, 1);
};
const save = () => {
  if (!formData.subject) {
    layer.msg('请选择所属学科', { icon: 5 });
    return;
  }
  if (selectedSourceTypes.value.length === 0) {
    layer.msg('请至少选择一个来源类型', { icon: 5 });
    return;
  }
  if (!formData.stickingPoint.trim()) {
    layer.msg('请输入卡点描述', { icon: 5 });
    return;
  }
  const saveData = {
    ...formData,
    sourceType: selectedSourceTypes.value
  };
  if (props.item) {
    dataManager.errorbook.update({ ...saveData, id: props.item.id });
    layer.msg('修改成功', { icon: 1 });
  }
  else {
    dataManager.errorbook.add(saveData);
    layer.msg('添加成功', { icon: 1 });
  }
  emit('saved');
};
</script>

<style scoped>
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
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  color: #64748b;
}

.modal-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 28px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.section-icon {
  font-size: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.add-similar-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #dbeafe;
  color: #2563eb;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-similar-btn:hover {
  background: #bfdbfe;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
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

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #334155;
  outline: none;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: #1e4d7b;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-textarea.large {
  min-height: 120px;
}

.image-upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
}

.image-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.image-preview-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
}

.image-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border: 2px dashed #cbd5e1;
  border-radius: 10px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-btn:hover {
  border-color: #1e4d7b;
  color: #1e4d7b;
}

.upload-btn i {
  font-size: 24px;
  margin-bottom: 6px;
}

.upload-btn span {
  font-size: 12px;
}

.upload-btn.small {
  width: 80px;
  height: 80px;
}

.upload-btn.small i {
  font-size: 20px;
}

.empty-similar {
  text-align: center;
  padding: 30px;
  background: #fff;
  border-radius: 10px;
  color: #94a3b8;
  font-size: 14px;
}

.similar-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.similar-item {
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.similar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.similar-index {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.remove-similar-btn {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
}

.remove-similar-btn:hover {
  background: #fee2e2;
}

.tag-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.tag-selected {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #dbeafe;
  color: #2563eb;
  border-radius: 20px;
  font-size: 13px;
}

.tag-remove {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.tag-input-wrapper {
  display: flex;
  align-items: center;
}

.tag-input {
  flex: 1;
  min-width: 120px;
  max-width: 200px;
}

.tag-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #1e4d7b;
  color: #fff;
  border: none;
  border-radius: 0 10px 10px 0;
  cursor: pointer;
  margin-left: -1px;
}

.source-type-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.type-option {
  padding: 4px 10px;
  background: #f1f5f9;
  border: none;
  border-radius: 16px;
  font-size: 12px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-option:hover {
  background: #dbeafe;
  color: #2563eb;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f1f5f9;
}

.btn-secondary {
  padding: 12px 24px;
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #1e4d7b 0%, #3d7ab5 100%);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(30, 77, 123, 0.3);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    max-width: none;
  }

  .image-preview-item {
    width: 80px;
    height: 80px;
  }

  .upload-btn {
    width: 80px;
    height: 80px;
  }

  .add-tag-row {
    flex-direction: column;
  }
}
</style>