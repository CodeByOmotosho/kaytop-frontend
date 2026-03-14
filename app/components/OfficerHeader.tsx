import { User, MapPin, Mail, Calendar } from "lucide-react";
import { OfficerInfo } from "../types/codashboard";

interface OfficerHeaderProps {
    officerInfo: OfficerInfo;
    dateRange: { start: string; end: string };
}

export function OfficerHeader({ officerInfo, dateRange }: OfficerHeaderProps) {
    const formatDate = (date: string) => new Date(date).toLocaleDateString();

    return (
        <div className="bg-white rounded-lg border p-6">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {officerInfo.name}
                        </h1>
                        <p className="text-gray-500">{officerInfo.email}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {officerInfo.branch}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(dateRange.start)} -{" "}
                                {formatDate(dateRange.end)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                    <span className="text-sm font-medium text-blue-700">
                        Credit Officer
                    </span>
                </div>
            </div>
        </div>
    );
}
