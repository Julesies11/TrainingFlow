import { Button } from '@/components/ui/button';

interface DeleteConfirmOverlayProps {
  onConfirm: () => void;
  onCancel: () => void;
  message?: string;
}

export function DeleteConfirmOverlay({ 
  onConfirm, 
  onCancel, 
  message = 'Delete this item?' 
}: DeleteConfirmOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="space-y-3 text-center">
        <p className="text-sm font-semibold text-white">{message}</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            className="bg-white"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
