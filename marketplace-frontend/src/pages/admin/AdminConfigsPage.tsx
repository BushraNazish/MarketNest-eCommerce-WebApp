import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { SystemConfigDto } from '../../services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const AdminConfigsPage = () => {
    const [configs, setConfigs] = useState<SystemConfigDto[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [configKey, setConfigKey] = useState('');
    const [configValue, setConfigValue] = useState('');
    const [description, setDescription] = useState('');
    const [editing, setEditing] = useState(false);

    const loadConfigs = async () => {
        try {
            const data = await adminService.getAllConfigs();
            setConfigs(data);
        } catch (error) {
            console.error("Failed to load generic configs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConfigs();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminService.upsertConfig(configKey, {
                configKey,
                configValue,
                description
            });
            setConfigKey('');
            setConfigValue('');
            setDescription('');
            setEditing(false);
            loadConfigs();
        } catch (error) {
            console.error("Failed to save config", error);
        }
    };

    const handleEdit = (config: SystemConfigDto) => {
        setConfigKey(config.configKey);
        setConfigValue(config.configValue);
        setDescription(config.description || '');
        setEditing(true);
    };

    if (loading) return <div className="p-8">Loading configs...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">System Configurations</h2>
            <Card>
                <CardHeader>
                    <CardTitle>{editing ? 'Edit Config' : 'Add New Config'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Config Key</label>
                                <Input
                                    value={configKey}
                                    onChange={(e) => setConfigKey(e.target.value)}
                                    required
                                    disabled={editing}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Config Value</label>
                                <Input
                                    value={configValue}
                                    onChange={(e) => setConfigValue(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit">{editing ? 'Update Config' : 'Save Config'}</Button>
                            {editing && (
                                <Button type="button" variant="outline" onClick={() => {
                                    setEditing(false);
                                    setConfigKey('');
                                    setConfigValue('');
                                    setDescription('');
                                }}>Cancel</Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Configurations</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-slate-50 dark:bg-slate-900">
                                <tr>
                                    <th className="px-4 py-3">Key</th>
                                    <th className="px-4 py-3">Value</th>
                                    <th className="px-4 py-3">Description</th>
                                    <th className="px-4 py-3">Updated At</th>
                                    <th className="px-4 py-3">Updated By</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {configs.map(config => (
                                    <tr key={config.id} className="border-b dark:border-slate-800">
                                        <td className="px-4 py-3 font-medium">{config.configKey}</td>
                                        <td className="px-4 py-3">{config.configValue}</td>
                                        <td className="px-4 py-3">{config.description}</td>
                                        <td className="px-4 py-3">{config.updatedAt ? new Date(config.updatedAt).toLocaleString() : ''}</td>
                                        <td className="px-4 py-3">{config.updatedBy}</td>
                                        <td className="px-4 py-3">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(config)}>
                                                Edit
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminConfigsPage;
