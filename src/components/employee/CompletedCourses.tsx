import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Award, Download, Printer, X } from "lucide-react";

// Define TypeScript interfaces
interface TrainingModule {
  _id: string;
  status: string;
  title: string;
  description: string;
  imgUrl: string;
  chapters: string[];
  assignments: string[];
  questions: string[];
  instructorId: string;
  order: number;
  category: string;
  updatedAt: string;
  moduleCompletionPercentage: number;
}

interface UserProgress {
  _id: string;
  userId: string;
  allowedModules: TrainingModule[];
  completedModules: TrainingModule[];
  moduleProgress: TrainingModule[];
}

interface Training {
  id: string;
  title: string;
  image: string;
  progress: number;
  dueDate: string;
  status: string;
}

// ─── Certificate Modal ────────────────────────────────────────────────────────

interface CertificateModalProps {
  training: Training;
  recipientName: string;
  onClose: () => void;
}

const CERT_W = 900;
const CERT_H = 620;
const DPR = 2; // pixel density for crisp rendering

const CertificateModal = ({ training, recipientName, onClose }: CertificateModalProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCertificate = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(DPR, DPR);
    const W = CERT_W;
    const H = CERT_H;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    // Outer border
    ctx.strokeStyle = "#1e3a5f";
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    // Inner border
    ctx.strokeStyle = "#c9a84c";
    ctx.lineWidth = 4;
    ctx.strokeRect(34, 34, W - 68, H - 68);

    // Corner ornaments
    const corners = [
      [50, 50], [W - 50, 50], [50, H - 50], [W - 50, H - 50],
    ];
    ctx.fillStyle = "#c9a84c";
    corners.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    // Header band
    const grad = ctx.createLinearGradient(0, 60, 0, 160);
    grad.addColorStop(0, "#1e3a5f");
    grad.addColorStop(1, "#2d5a8e");
    ctx.fillStyle = grad;
    ctx.fillRect(34, 60, W - 68, 100);

    // Header text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 38px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("CERTIFICATE OF COMPLETION", W / 2, 122);

    // Gold line under header
    ctx.strokeStyle = "#c9a84c";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(80, 170);
    ctx.lineTo(W - 80, 170);
    ctx.stroke();

    // "This is to certify that"
    ctx.fillStyle = "#555555";
    ctx.font = "italic 22px Georgia, serif";
    ctx.fillText("This is to certify that", W / 2, 220);

    // Recipient name
    ctx.fillStyle = "#1e3a5f";
    ctx.font = "bold 42px Georgia, serif";
    ctx.fillText(recipientName, W / 2, 280);

    // Underline name
    const nameWidth = ctx.measureText(recipientName).width;
    ctx.strokeStyle = "#c9a84c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - nameWidth / 2, 292);
    ctx.lineTo(W / 2 + nameWidth / 2, 292);
    ctx.stroke();

    // "has successfully completed"
    ctx.fillStyle = "#555555";
    ctx.font = "italic 22px Georgia, serif";
    ctx.fillText("has successfully completed the training module", W / 2, 340);

    // Course title
    ctx.fillStyle = "#1e3a5f";
    ctx.font = "bold 30px Georgia, serif";
    // Wrap long titles
    const maxWidth = W - 160;
    const words = training.title.split(" ");
    let line = "";
    let lineY = 395;
    words.forEach((word, i) => {
      const testLine = line + word + " ";
      if (ctx.measureText(testLine).width > maxWidth && i > 0) {
        ctx.fillText(line.trim(), W / 2, lineY);
        line = word + " ";
        lineY += 40;
      } else {
        line = testLine;
      }
    });
    ctx.fillText(line.trim(), W / 2, lineY);

    // Completion date
    const completionDate = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
    ctx.fillStyle = "#777777";
    ctx.font = "18px Georgia, serif";
    ctx.fillText(`Completed on: ${completionDate}`, W / 2, lineY + 60);

    // Decorative divider
    ctx.strokeStyle = "#c9a84c";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(80, lineY + 90);
    ctx.lineTo(W - 80, lineY + 90);
    ctx.stroke();
    ctx.setLineDash([]);

    // Signature line
    const sigY = H - 110;
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 120, sigY);
    ctx.lineTo(W / 2 + 120, sigY);
    ctx.stroke();

    ctx.fillStyle = "#333333";
    ctx.font = "16px Georgia, serif";
    ctx.fillText("Authorized Signature", W / 2, sigY + 22);

    // Seal circle
    ctx.beginPath();
    ctx.arc(W - 130, H - 120, 55, 0, Math.PI * 2);
    ctx.strokeStyle = "#c9a84c";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(W - 130, H - 120, 44, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#1e3a5f";
    ctx.font = "bold 13px Arial, sans-serif";
    ctx.fillText("OFFICIAL", W - 130, H - 126);
    ctx.fillText("SEAL", W - 130, H - 110);

    // Footer
    ctx.fillStyle = "#aaaaaa";
    ctx.font = "13px Arial, sans-serif";
    ctx.fillText("Elevatics360 Learning & Development", W / 2, H - 42);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CERT_W * DPR;
    canvas.height = CERT_H * DPR;
    canvas.style.width = `${CERT_W}px`;
    canvas.style.height = `${CERT_H}px`;
    drawCertificate(canvas);
  }, []);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `Certificate_${training.title.replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate – ${training.title}</title>
          <style>
            @page { size: landscape; margin: 0; }
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f3f4f6; }
            img { width: 100%; max-width: 960px; box-shadow: 0 4px 32px rgba(0,0,0,0.18); }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print()" />
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col gap-0 my-auto">

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Certificate of Completion
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </button>
            <button
              onClick={onClose}
              className="ml-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="w-full bg-gray-100 dark:bg-dark-900 flex items-center justify-center p-6 rounded-b-2xl overflow-x-auto">
          <canvas
            ref={canvasRef}
            className="rounded-lg shadow-xl block"
            style={{ maxWidth: "100%" }}
          />
        </div>
      </div>
    </div>
  );
};

// ─── Training Card ────────────────────────────────────────────────────────────

interface TrainingCardProps {
  training: Training;
  onViewCertificate: (training: Training) => void;
}

const TrainingCard = ({ training, onViewCertificate }: TrainingCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700 overflow-hidden hover:shadow-md transition-shadow">
      <img
        src={training.image}
        alt={training.title}
        className="w-full h-48 object-cover cursor-pointer"
        onClick={() => navigate(`/training/${training.id}`)}
      />
      <div className="p-6">
        <h3
          className="text-lg font-medium text-gray-900 dark:text-white mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition"
          onClick={() => navigate(`/training/${training.id}`)}
        >
          {training.title}
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{training.progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-dark-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${training.progress}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs font-medium">
              {training.status}
            </span>
            <button
              onClick={() => onViewCertificate(training)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700 rounded-lg text-xs font-medium transition"
            >
              <Award className="w-3.5 h-3.5" />
              View Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── CompletedCourses ─────────────────────────────────────────────────────────

const CompletedCourses = () => {
  const token = useSelector((state: any) => state.auth.token);
  const user = useSelector((state: any) => state.auth.user);
  const username = user?.username || "User";
  const [assignedTrainings, setAssignedTrainings] = useState<Training[]>([]);
  const [certificateTraining, setCertificateTraining] = useState<Training | null>(null);

  useEffect(() => {
    if (!token) {
      alert("You are not logged in. Please log in to continue.");
      return;
    }

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user-progress`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("No module has been assigned to this user.");
        }
        return res.json();
      })
      .then((data: UserProgress) => {
        console.log("this is user progress", data);

        const formattedTrainings = data.allowedModules
          .filter(
            (module) =>
              module._id &&
              module.status === "published" &&
              module.moduleCompletionPercentage === 100,
          )
          .map((module) => ({
            id: module._id,
            title: module.title,
            image: module.imgUrl,
            progress: module.moduleCompletionPercentage || 0,
            dueDate: "2024-04-15",
            status:
              module.moduleCompletionPercentage === 100
                ? "Completed"
                : "In Progress",
          }));

        setAssignedTrainings(formattedTrainings);
      })
      .catch((error) => {
        console.error("Error fetching user progress:", error);
        alert(error.message);
      });
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Completed Training
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Modules you have fully completed — view and download your certificates below
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignedTrainings.length > 0 ? (
          assignedTrainings.map((training) => (
            <TrainingCard
              key={training.id}
              training={training}
              onViewCertificate={setCertificateTraining}
            />
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No completed training modules yet.
          </p>
        )}
      </div>

      {certificateTraining && (
        <CertificateModal
          training={certificateTraining}
          recipientName={username}
          onClose={() => setCertificateTraining(null)}
        />
      )}
    </div>
  );
};

export default CompletedCourses;
