using MediatR;
using SmartMedicationDispenser.Application.Common.Interfaces;

namespace SmartMedicationDispenser.Application.Integrations;

public class DeleteWebhookEndpointCommandHandler : IRequestHandler<DeleteWebhookEndpointCommand, bool>
{
    private readonly IWebhookEndpointRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteWebhookEndpointCommandHandler(IWebhookEndpointRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteWebhookEndpointCommand request, CancellationToken cancellationToken)
    {
        var ok = await _repository.DeleteAsync(request.WebhookId, request.UserId, cancellationToken);
        if (ok) await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ok;
    }
}
