import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import GoalForm from '../../components/GoalForm';
import toast from 'react-hot-toast';

export default function EditGoal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  useEffect(() => {
    api.get('/api/goals').then((res) => setForm(res.data.find((g) => g.id === id) || {}));
  }, [id]);
  const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const save = async () => {
    try {
      await api.put(`/api/goals/${id}`, form);
      toast.success('Goal updated');
      navigate('/employee/goals');
    } catch {
      toast.error('Update failed');
    }
  };

  const deleteDraft = async () => {
    try {
      await api.delete(`/api/goals/${id}`);
      toast.success('Draft deleted');
      navigate('/employee/goals');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Delete failed');
    }
  };

  const shared = form.is_shared && form.shared_from;
  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl">Edit Goal</h1>
      {shared && (
        <div className="rounded bg-amber-50 p-3 text-sm">
          This is a shared goal. Only weightage can be adjusted.
        </div>
      )}
      <GoalForm
        value={form}
        onChange={onChange}
        totalWeightage={0}
        onSubmitDraft={save}
        onSubmitApproval={save}
        onDeleteDraft={deleteDraft}
        readOnlyShared={shared}
      />
    </div>
  );
}
