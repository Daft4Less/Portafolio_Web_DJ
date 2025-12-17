import java.util.List;

public class Project {

    private String id;
    private String name;
    private String description;
    private String section;
    private String participationType;
    private String repositoryLink;
    private String deploymentLink;
    private List<String> technologies;
    private String userId;

    public Project() {}

    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }

    public String getSection() {
        return section;
    }
    
    public void setSection(String section) {
        this.section = section;
    }

    public String getParticipationType() {
        return participationType;
    }

    public void setParticipationType(String participationType) {
        this.participationType = participationType;
    }

    public String getRepositoryLink() {
        return repositoryLink;
    }

    public void setRepositoryLink(String repositoryLink) {
        this.repositoryLink = repositoryLink;
    }

    public String getDeploymentLink() {
        return deploymentLink;
    }

    public void setDeploymentLink(String deploymentLink) {
        this.deploymentLink = deploymentLink;
    }

    public List<String> getTechnologies() {
        return technologies;
    }

    public void setTechnologies(List<String> technologies) {
        this.technologies = technologies;
    }

    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
}
